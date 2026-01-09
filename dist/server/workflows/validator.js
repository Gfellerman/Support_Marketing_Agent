/**
 * Workflow Validation Engine
 *
 * Validates workflow configurations for integrity, connectivity, and logical correctness
 */
/**
 * Validate a complete workflow configuration
 */
export function validateWorkflow(steps) {
    const errors = [];
    const warnings = [];
    // Check if workflow has at least one step
    if (!steps || steps.length === 0) {
        errors.push({
            type: "error",
            message: "Workflow must contain at least one step",
            code: "EMPTY_WORKFLOW",
        });
        return { isValid: false, errors, warnings };
    }
    // Check for trigger step
    const hasTrigger = steps.some(step => step.type === "trigger");
    if (!hasTrigger) {
        errors.push({
            type: "error",
            message: "Workflow must have a trigger step",
            code: "NO_TRIGGER",
        });
    }
    // Validate each step
    for (const step of steps) {
        const stepErrors = validateStep(step);
        errors.push(...stepErrors);
    }
    // Check for disconnected steps (orphaned nodes)
    const disconnectedSteps = findDisconnectedSteps(steps);
    for (const stepId of disconnectedSteps) {
        errors.push({
            type: "error",
            stepId,
            message: `Step "${stepId}" is not connected to the workflow`,
            code: "DISCONNECTED_STEP",
        });
    }
    // Check for circular dependencies
    const circularPaths = findCircularDependencies(steps);
    if (circularPaths.length > 0) {
        warnings.push({
            type: "warning",
            message: `Potential infinite loop detected in workflow path`,
            code: "CIRCULAR_DEPENDENCY",
        });
    }
    // Check for unreachable steps
    const unreachableSteps = findUnreachableSteps(steps);
    for (const stepId of unreachableSteps) {
        warnings.push({
            type: "warning",
            stepId,
            message: `Step "${stepId}" may never be reached`,
            code: "UNREACHABLE_STEP",
        });
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Validate an individual workflow step
 */
function validateStep(step) {
    const errors = [];
    // Validate step has required ID
    if (!step.id) {
        errors.push({
            type: "error",
            message: "Step is missing required ID",
            code: "MISSING_STEP_ID",
        });
        return errors;
    }
    // Validate based on step type
    switch (step.type) {
        case "trigger":
            errors.push(...validateTriggerStep(step));
            break;
        case "delay":
            errors.push(...validateDelayStep(step));
            break;
        case "send_email":
            errors.push(...validateEmailStep(step));
            break;
        case "condition":
            errors.push(...validateConditionStep(step));
            break;
        case "add_tag":
        case "remove_tag":
            errors.push(...validateTagStep(step));
            break;
        case "webhook":
            errors.push(...validateWebhookStep(step));
            break;
        case "update_field":
            errors.push(...validateUpdateFieldStep(step));
            break;
        default:
            errors.push({
                type: "error",
                stepId: step.id,
                message: `Unknown step type: ${step.type}`,
                code: "INVALID_STEP_TYPE",
            });
    }
    return errors;
}
/**
 * Validate trigger step configuration
 */
function validateTriggerStep(step) {
    const errors = [];
    if (!step.config?.event) {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "event",
            message: "Trigger step must specify an event type",
            code: "MISSING_TRIGGER_EVENT",
        });
    }
    return errors;
}
/**
 * Validate delay step configuration
 */
function validateDelayStep(step) {
    const errors = [];
    const duration = step.config?.duration;
    const unit = step.config?.unit;
    if (!duration || duration <= 0) {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "duration",
            message: "Delay step must have a positive duration",
            code: "INVALID_DELAY_DURATION",
        });
    }
    if (!unit || !["minutes", "hours", "days", "weeks"].includes(unit)) {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "unit",
            message: "Delay step must specify a valid time unit",
            code: "INVALID_DELAY_UNIT",
        });
    }
    return errors;
}
/**
 * Validate email step configuration
 */
function validateEmailStep(step) {
    const errors = [];
    if (!step.config?.templateId && !step.config?.subject) {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "template",
            message: "Email step must have a template or subject",
            code: "MISSING_EMAIL_TEMPLATE",
        });
    }
    if (!step.config?.templateId && !step.config?.content) {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "content",
            message: "Email step must have content",
            code: "MISSING_EMAIL_CONTENT",
        });
    }
    return errors;
}
/**
 * Validate condition step configuration
 */
function validateConditionStep(step) {
    const errors = [];
    if (!step.config?.conditions || step.config.conditions.length === 0) {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "conditions",
            message: "Condition step must have at least one condition",
            code: "MISSING_CONDITIONS",
        });
    }
    // Validate each condition
    if (step.config?.conditions) {
        for (const condition of step.config.conditions) {
            if (!condition.field) {
                errors.push({
                    type: "error",
                    stepId: step.id,
                    field: "conditions",
                    message: "Condition must specify a field",
                    code: "MISSING_CONDITION_FIELD",
                });
            }
            if (!condition.operator) {
                errors.push({
                    type: "error",
                    stepId: step.id,
                    field: "conditions",
                    message: "Condition must specify an operator",
                    code: "MISSING_CONDITION_OPERATOR",
                });
            }
        }
    }
    // Check for branches
    if (!step.config?.trueBranch && !step.config?.falseBranch) {
        errors.push({
            type: "error",
            stepId: step.id,
            message: "Condition step must have at least one branch defined",
            code: "MISSING_CONDITION_BRANCHES",
        });
    }
    return errors;
}
/**
 * Validate tag operation step
 */
function validateTagStep(step) {
    const errors = [];
    if (!step.config?.tag || step.config.tag.trim() === "") {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "tag",
            message: "Tag step must specify a tag name",
            code: "MISSING_TAG_NAME",
        });
    }
    return errors;
}
/**
 * Validate webhook step configuration
 */
function validateWebhookStep(step) {
    const errors = [];
    if (!step.config?.url) {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "url",
            message: "Webhook step must have a URL",
            code: "MISSING_WEBHOOK_URL",
        });
    }
    else {
        // Validate URL format
        try {
            new URL(step.config.url);
        }
        catch {
            errors.push({
                type: "error",
                stepId: step.id,
                field: "url",
                message: "Webhook URL is not valid",
                code: "INVALID_WEBHOOK_URL",
            });
        }
    }
    if (!step.config?.method || !["GET", "POST", "PUT", "PATCH"].includes(step.config.method)) {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "method",
            message: "Webhook step must specify a valid HTTP method",
            code: "INVALID_WEBHOOK_METHOD",
        });
    }
    return errors;
}
/**
 * Validate update field step configuration
 */
function validateUpdateFieldStep(step) {
    const errors = [];
    if (!step.config?.field) {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "field",
            message: "Update field step must specify a field name",
            code: "MISSING_UPDATE_FIELD",
        });
    }
    if (step.config?.value === undefined || step.config?.value === null) {
        errors.push({
            type: "error",
            stepId: step.id,
            field: "value",
            message: "Update field step must specify a value",
            code: "MISSING_UPDATE_VALUE",
        });
    }
    return errors;
}
/**
 * Find steps that are not connected to the main workflow graph
 */
function findDisconnectedSteps(steps) {
    if (steps.length === 0)
        return [];
    const disconnected = [];
    const visited = new Set();
    // Find trigger step as starting point
    const triggerStep = steps.find(s => s.type === "trigger");
    if (!triggerStep)
        return steps.map(s => s.id);
    // BFS traversal from trigger
    const queue = [triggerStep.id];
    visited.add(triggerStep.id);
    while (queue.length > 0) {
        const currentId = queue.shift();
        const currentStep = steps.find(s => s.id === currentId);
        if (!currentStep)
            continue;
        // Add next steps to queue
        if (currentStep.next) {
            if (!visited.has(currentStep.next)) {
                visited.add(currentStep.next);
                queue.push(currentStep.next);
            }
        }
        // For condition steps, check both branches
        if (currentStep.type === "condition") {
            const trueBranch = currentStep.config?.trueBranch;
            const falseBranch = currentStep.config?.falseBranch;
            if (trueBranch && !visited.has(trueBranch)) {
                visited.add(trueBranch);
                queue.push(trueBranch);
            }
            if (falseBranch && !visited.has(falseBranch)) {
                visited.add(falseBranch);
                queue.push(falseBranch);
            }
        }
    }
    // Find steps not visited
    for (const step of steps) {
        if (!visited.has(step.id)) {
            disconnected.push(step.id);
        }
    }
    return disconnected;
}
/**
 * Detect circular dependencies in workflow
 */
function findCircularDependencies(steps) {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    function dfs(stepId, path) {
        if (recursionStack.has(stepId)) {
            // Found a cycle
            const cycleStart = path.indexOf(stepId);
            cycles.push(path.slice(cycleStart));
            return true;
        }
        if (visited.has(stepId)) {
            return false;
        }
        visited.add(stepId);
        recursionStack.add(stepId);
        path.push(stepId);
        const step = steps.find(s => s.id === stepId);
        if (step) {
            if (step.next) {
                dfs(step.next, [...path]);
            }
            if (step.type === "condition") {
                const trueBranch = step.config?.trueBranch;
                const falseBranch = step.config?.falseBranch;
                if (trueBranch) {
                    dfs(trueBranch, [...path]);
                }
                if (falseBranch) {
                    dfs(falseBranch, [...path]);
                }
            }
        }
        recursionStack.delete(stepId);
        return false;
    }
    const triggerStep = steps.find(s => s.type === "trigger");
    if (triggerStep) {
        dfs(triggerStep.id, []);
    }
    return cycles;
}
/**
 * Find steps that can never be reached from the trigger
 */
function findUnreachableSteps(steps) {
    // This is similar to findDisconnectedSteps but checks for logical reachability
    // For now, we'll use the same logic
    return findDisconnectedSteps(steps);
}
