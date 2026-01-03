import { describe, it, expect } from "vitest";
import { validateWorkflow, WorkflowStep } from "./workflows/validator";

describe("Workflow Validation", () => {
  it("should reject empty workflow", () => {
    const result = validateWorkflow([]);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.code).toBe("EMPTY_WORKFLOW");
  });

  it("should reject workflow without trigger", () => {
    const steps: WorkflowStep[] = [
      {
        id: "step-1",
        type: "send_email",
        config: {
          subject: "Test",
          content: "Test email",
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === "NO_TRIGGER")).toBe(true);
  });

  it("should accept valid simple workflow", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "step-1",
      },
      {
        id: "step-1",
        type: "send_email",
        config: {
          subject: "Welcome!",
          content: "Welcome to our platform",
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect disconnected steps", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "step-1",
      },
      {
        id: "step-1",
        type: "send_email",
        config: {
          subject: "Welcome!",
          content: "Welcome",
        },
      },
      {
        id: "step-orphan",
        type: "send_email",
        config: {
          subject: "Orphaned",
          content: "This step is disconnected",
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === "DISCONNECTED_STEP" && e.stepId === "step-orphan")).toBe(true);
  });

  it("should validate delay step configuration", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "delay-1",
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          duration: -5, // Invalid: negative duration
          unit: "hours",
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === "INVALID_DELAY_DURATION")).toBe(true);
  });

  it("should validate delay step requires valid unit", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "delay-1",
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          duration: 5,
          unit: "invalid_unit", // Invalid unit
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === "INVALID_DELAY_UNIT")).toBe(true);
  });

  it("should validate email step requires template or content", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "email-1",
      },
      {
        id: "email-1",
        type: "send_email",
        config: {
          // Missing subject and content
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === "MISSING_EMAIL_TEMPLATE" || e.code === "MISSING_EMAIL_CONTENT")).toBe(true);
  });

  it("should validate condition step requires conditions", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "condition-1",
      },
      {
        id: "condition-1",
        type: "condition",
        config: {
          // Missing conditions array
          trueBranch: "step-true",
          falseBranch: "step-false",
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === "MISSING_CONDITIONS")).toBe(true);
  });

  it("should validate condition step requires branches", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "condition-1",
      },
      {
        id: "condition-1",
        type: "condition",
        config: {
          conditions: [
            {
              field: "orderCount",
              operator: "greater_than",
              value: 0,
            },
          ],
          // Missing trueBranch and falseBranch
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === "MISSING_CONDITION_BRANCHES")).toBe(true);
  });

  it("should validate tag step requires tag name", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "tag-1",
      },
      {
        id: "tag-1",
        type: "add_tag",
        config: {
          tag: "", // Empty tag name
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === "MISSING_TAG_NAME")).toBe(true);
  });

  it("should validate webhook URL format", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "webhook-1",
      },
      {
        id: "webhook-1",
        type: "webhook",
        config: {
          url: "not-a-valid-url",
          method: "POST",
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === "INVALID_WEBHOOK_URL")).toBe(true);
  });

  it("should validate webhook requires valid HTTP method", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "webhook-1",
      },
      {
        id: "webhook-1",
        type: "webhook",
        config: {
          url: "https://example.com/webhook",
          method: "INVALID", // Invalid HTTP method
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === "INVALID_WEBHOOK_METHOD")).toBe(true);
  });

  it("should accept valid complex workflow with branches", () => {
    const steps: WorkflowStep[] = [
      {
        id: "trigger",
        type: "trigger",
        config: {
          event: "contact_created",
        },
        next: "condition-1",
      },
      {
        id: "condition-1",
        type: "condition",
        config: {
          conditions: [
            {
              field: "orderCount",
              operator: "greater_than",
              value: 0,
            },
          ],
          trueBranch: "email-existing",
          falseBranch: "email-new",
        },
      },
      {
        id: "email-existing",
        type: "send_email",
        config: {
          subject: "Welcome back!",
          content: "Thanks for being a customer",
        },
      },
      {
        id: "email-new",
        type: "send_email",
        config: {
          subject: "Welcome!",
          content: "Welcome to our platform",
        },
      },
    ];

    const result = validateWorkflow(steps);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
