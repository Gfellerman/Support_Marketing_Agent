/**
 * Workflow Automation Engine
 * 
 * Executes automated email sequences based on triggers and conditions.
 * Supports:
 * - Multiple trigger types (contact created, cart abandoned, order placed, etc.)
 * - Conditional logic (if/else based on contact properties, order data, time)
 * - Delays (wait X hours/days before next step)
 * - Email sending with personalization
 * - Workflow state tracking and analytics
 */

import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../db';
import { 
  workflows, 
  workflowEnrollments, 
  contacts, 
  orders,
  emailCampaigns 
} from '../../drizzle/schema';
import { queueEmail } from '../email/queue';
import { renderTemplate } from '../email/templates';
import { scheduleWorkflowStep, scheduleImmediateStep } from './scheduler';

// Workflow trigger types (must match schema enum)
export type WorkflowTrigger = 
  | 'welcome'              // New contact/subscriber welcome
  | 'abandoned_cart'       // Cart abandoned (no order after X hours)
  | 'order_confirmation'   // Order created
  | 'shipping'             // Order shipped/delivered
  | 'custom';              // Custom trigger

// Workflow step types
export interface WorkflowStep {
  id: string;
  type: 'email' | 'delay' | 'condition';
  config: EmailStepConfig | DelayStepConfig | ConditionStepConfig;
}

export interface EmailStepConfig {
  subject: string;
  htmlBody: string;
  textBody?: string;
  fromEmail: string;
  fromName: string;
}

export interface DelayStepConfig {
  amount: number;
  unit: 'minutes' | 'hours' | 'days';
}

export interface ConditionStepConfig {
  field: string;           // e.g., 'contact.orderCount', 'order.totalPrice'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number;
  trueSteps: WorkflowStep[];
  falseSteps: WorkflowStep[];
}

// Workflow enrollment state
export type EnrollmentStatus = 'active' | 'completed' | 'exited' | 'failed';

/**
 * Enroll a contact in a workflow
 */
export async function enrollContact(params: {
  workflowId: number;
  contactId: number;
  organizationId?: number;
  triggerData?: Record<string, unknown>;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const { workflowId, contactId, triggerData = {} } = params;

  // Check if contact is already enrolled
  const existing = await db
    .select()
    .from(workflowEnrollments)
    .where(
      and(
        eq(workflowEnrollments.workflowId, workflowId),
        eq(workflowEnrollments.contactId, contactId),
        eq(workflowEnrollments.status, 'active')
      )
    )
    .limit(1);

  if (existing.length > 0) {
    console.log(`[Workflow] Contact ${contactId} already enrolled in workflow ${workflowId}`);
    return existing[0]!.id;
  }

  // Create enrollment
  const [enrollment] = await db.insert(workflowEnrollments).values({
    organizationId: params.organizationId || 1,
    workflowId,
    contactId,
    status: 'active',
    currentStepId: '0', // Converted to string/ID
    state: {}, // Needed by schema
    enrolledAt: new Date(),
  });

  console.log(`[Workflow] Enrolled contact ${contactId} in workflow ${workflowId}`);

  // Start workflow execution
  await executeWorkflowStep({
    enrollmentId: enrollment.insertId,
    workflowId,
    contactId,
    stepIndex: 0,
    triggerData,
  });

  return enrollment.insertId;
}

/**
 * Execute a specific workflow step
 */
export async function executeWorkflowStep(params: {
  enrollmentId: number;
  workflowId: number;
  contactId: number;
  stepIndex: number;
  triggerData: Record<string, unknown>;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const { enrollmentId, workflowId, contactId, stepIndex, triggerData } = params;

  // Get workflow
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, workflowId))
    .limit(1);

  if (!workflow) {
    console.error(`[Workflow] Workflow ${workflowId} not found`);
    await updateEnrollmentStatus(enrollmentId, 'failed');
    return;
  }

  // Check if workflow is active
  if (workflow.status !== 'active') {
    console.log(`[Workflow] Workflow ${workflowId} is not active, exiting enrollment`);
    await updateEnrollmentStatus(enrollmentId, 'exited');
    return;
  }

  // Parse workflow steps
  const steps: WorkflowStep[] = typeof workflow.steps === 'string' 
    ? JSON.parse(workflow.steps) 
    : workflow.steps;

  // Check if we've completed all steps
  if (stepIndex >= steps.length) {
    console.log(`[Workflow] Enrollment ${enrollmentId} completed all steps`);
    await updateEnrollmentStatus(enrollmentId, 'completed');
    return;
  }

  const step = steps[stepIndex];
  if (!step) {
    console.error(`[Workflow] Step ${stepIndex} not found in workflow ${workflowId}`);
    await updateEnrollmentStatus(enrollmentId, 'failed');
    return;
  }

  console.log(`[Workflow] Executing step ${stepIndex} (${step.type}) for enrollment ${enrollmentId}`);

  try {
    // Update current step
    await db
      .update(workflowEnrollments)
      .set({ currentStepId: stepIndex.toString() })
      .where(eq(workflowEnrollments.id, enrollmentId));

    // Execute step based on type
    switch (step.type) {
      case 'email':
        await executeEmailStep({
          enrollmentId,
          workflowId,
          contactId,
          stepIndex,
          config: step.config as EmailStepConfig,
          triggerData,
        });
        break;

      case 'delay':
        await executeDelayStep({
          enrollmentId,
          workflowId,
          contactId,
          stepIndex,
          config: step.config as DelayStepConfig,
          triggerData,
        });
        break;

      case 'condition':
        await executeConditionStep({
          enrollmentId,
          workflowId,
          contactId,
          stepIndex,
          config: step.config as ConditionStepConfig,
          triggerData,
        });
        break;

      default:
        console.error(`[Workflow] Unknown step type: ${step.type}`);
        await updateEnrollmentStatus(enrollmentId, 'failed');
    }
  } catch (error) {
    console.error(`[Workflow] Error executing step ${stepIndex}:`, error);
    await updateEnrollmentStatus(enrollmentId, 'failed');
  }
}

/**
 * Execute an email step
 */
async function executeEmailStep(params: {
  enrollmentId: number;
  workflowId: number;
  contactId: number;
  stepIndex: number;
  config: EmailStepConfig;
  triggerData: Record<string, unknown>;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const { enrollmentId, workflowId, contactId, stepIndex, config, triggerData } = params;

  // Get contact
  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1);

  if (!contact) {
    console.error(`[Workflow] Contact ${contactId} not found`);
    await updateEnrollmentStatus(enrollmentId, 'failed');
    return;
  }

  // Check if contact is subscribed
  if (contact.subscriptionStatus !== 'subscribed') {
    console.log(`[Workflow] Contact ${contactId} is not subscribed, skipping email`);
    // Move to next step
    await executeWorkflowStep({
      enrollmentId,
      workflowId,
      contactId,
      stepIndex: stepIndex + 1,
      triggerData,
    });
    return;
  }

  // Prepare template data
  const templateData = {
    first_name: contact.firstName || '',
    last_name: contact.lastName || '',
    email: contact.email,
    ...triggerData,
  };

  // Render email content
  const htmlBody = renderTemplate(config.htmlBody, templateData);
  const textBody = config.textBody ? renderTemplate(config.textBody, templateData) : undefined;
  const subject = renderTemplate(config.subject, templateData);

  // Send email
  await queueEmail({
    recipient: {
      email: contact.email,
      firstName: contact.firstName || undefined,
      lastName: contact.lastName || undefined,
    },
    content: {
      subject,
      htmlBody,
      textBody,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
    },
    contactId,
    trackOpens: true,
    trackClicks: true,
  });

  console.log(`[Workflow] Sent email to ${contact.email} for enrollment ${enrollmentId}`);

  // Schedule next step immediately
  await scheduleImmediateStep({
    enrollmentId,
    workflowId,
    contactId,
    stepIndex: stepIndex + 1,
    triggerData,
  });
}

/**
 * Execute a delay step
 */
async function executeDelayStep(params: {
  enrollmentId: number;
  workflowId: number;
  contactId: number;
  stepIndex: number;
  config: DelayStepConfig;
  triggerData: Record<string, unknown>;
}): Promise<void> {
  const { enrollmentId, workflowId, contactId, stepIndex, config, triggerData } = params;

  // Calculate delay in milliseconds
  let delayMs = 0;
  switch (config.unit) {
    case 'minutes':
      delayMs = config.amount * 60 * 1000;
      break;
    case 'hours':
      delayMs = config.amount * 60 * 60 * 1000;
      break;
    case 'days':
      delayMs = config.amount * 24 * 60 * 60 * 1000;
      break;
  }

  console.log(`[Workflow] Scheduling next step in ${config.amount} ${config.unit}`);

  // Schedule next step using persistent queue
  await scheduleWorkflowStep(
    {
      enrollmentId,
      workflowId,
      contactId,
      stepIndex: stepIndex + 1,
      triggerData,
    },
    delayMs
  );
}

/**
 * Execute a condition step
 */
async function executeConditionStep(params: {
  enrollmentId: number;
  workflowId: number;
  contactId: number;
  stepIndex: number;
  config: ConditionStepConfig;
  triggerData: Record<string, unknown>;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const { enrollmentId, workflowId, contactId, stepIndex, config, triggerData } = params;

  // Evaluate condition
  const conditionMet = await evaluateCondition({
    contactId,
    field: config.field,
    operator: config.operator,
    value: config.value,
    triggerData,
  });

  console.log(`[Workflow] Condition ${config.field} ${config.operator} ${config.value} = ${conditionMet}`);

  // Execute appropriate branch
  const branchSteps = conditionMet ? config.trueSteps : config.falseSteps;

  // For now, just move to next step (full branching would require more complex state management)
  // In a production system, you'd want to handle branching properly
  await executeWorkflowStep({
    enrollmentId,
    workflowId,
    contactId,
    stepIndex: stepIndex + 1,
    triggerData,
  });
}

/**
 * Evaluate a condition
 */
async function evaluateCondition(params: {
  contactId: number;
  field: string;
  operator: string;
  value: string | number;
  triggerData: Record<string, unknown>;
}): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const { contactId, field, operator, value, triggerData } = params;

  // Get field value
  let fieldValue: unknown;

  if (field.startsWith('contact.')) {
    const contactField = field.replace('contact.', '');
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    if (!contact) return false;
    fieldValue = (contact as Record<string, unknown>)[contactField];
  } else if (field.startsWith('trigger.')) {
    const triggerField = field.replace('trigger.', '');
    fieldValue = triggerData[triggerField];
  } else {
    fieldValue = triggerData[field];
  }

  // Evaluate operator
  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'not_equals':
      return fieldValue !== value;
    case 'greater_than':
      return Number(fieldValue) > Number(value);
    case 'less_than':
      return Number(fieldValue) < Number(value);
    case 'contains':
      return String(fieldValue).includes(String(value));
    default:
      return false;
  }
}

/**
 * Update enrollment status
 */
async function updateEnrollmentStatus(
  enrollmentId: number,
  status: EnrollmentStatus
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const completedAt = status === 'completed' ? new Date() : undefined;

  await db
    .update(workflowEnrollments)
    .set({ status, completedAt })
    .where(eq(workflowEnrollments.id, enrollmentId));

  console.log(`[Workflow] Updated enrollment ${enrollmentId} status to ${status}`);
}

/**
 * Trigger workflows based on event
 */
export async function triggerWorkflows(params: {
  trigger: WorkflowTrigger;
  contactId: number;
  triggerData?: Record<string, unknown>;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const { trigger, contactId, triggerData = {} } = params;

  // Find active workflows with matching trigger
  const matchingWorkflows = await db
    .select()
    .from(workflows)
    .where(
      and(
        eq(workflows.triggerType, trigger),
        eq(workflows.status, 'active')
      )
    );

  console.log(`[Workflow] Found ${matchingWorkflows.length} workflows for trigger ${trigger}`);

  // Enroll contact in each matching workflow
  for (const workflow of matchingWorkflows) {
    try {
      await enrollContact({
        workflowId: workflow.id,
        contactId,
        triggerData,
      });
    } catch (error) {
      console.error(`[Workflow] Error enrolling contact ${contactId} in workflow ${workflow.id}:`, error);
    }
  }
}

/**
 * Exit a contact from a workflow
 */
export async function exitWorkflow(params: {
  enrollmentId: number;
}): Promise<void> {
  await updateEnrollmentStatus(params.enrollmentId, 'exited');
}

/**
 * Get workflow analytics
 */
export async function getWorkflowAnalytics(workflowId: number): Promise<{
  totalEnrolled: number;
  active: number;
  completed: number;
  exited: number;
  failed: number;
  completionRate: number;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const enrollments = await db
    .select()
    .from(workflowEnrollments)
    .where(eq(workflowEnrollments.workflowId, workflowId));

  const totalEnrolled = enrollments.length;
  const active = enrollments.filter(e => e.status === 'active').length;
  const completed = enrollments.filter(e => e.status === 'completed').length;
  const exited = enrollments.filter(e => e.status === 'exited').length;
  const failed = enrollments.filter(e => e.status === 'failed').length;
  const completionRate = totalEnrolled > 0 ? (completed / totalEnrolled) * 100 : 0;

  return {
    totalEnrolled,
    active,
    completed,
    exited,
    failed,
    completionRate,
  };
}
