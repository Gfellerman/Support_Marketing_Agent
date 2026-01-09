/**
 * Order-Aware Response Templates
 * Dynamic templates for common e-commerce support scenarios
 */
/**
 * Replace placeholders in template with actual order data
 */
export function hydrateTemplate(template, order, customerName) {
    let result = template;
    // Customer placeholders
    result = result.replace(/{{customer_name}}/g, customerName || 'Valued Customer');
    result = result.replace(/{{customer_first_name}}/g, customerName?.split(' ')[0] || 'there');
    // Order placeholders
    if (order) {
        result = result.replace(/{{order_number}}/g, order.orderNumber);
        result = result.replace(/{{order_status}}/g, order.status);
        result = result.replace(/{{tracking_number}}/g, order.trackingNumber || '[tracking pending]');
        result = result.replace(/{{carrier}}/g, order.carrier || 'the carrier');
        result = result.replace(/{{estimated_delivery}}/g, order.estimatedDelivery || 'soon');
        result = result.replace(/{{order_total}}/g, order.totalPrice ? `$${order.totalPrice.toFixed(2)}` : '[amount]');
        if (order.items && order.items.length > 0) {
            result = result.replace(/{{item_list}}/g, order.items.map(i => `${i.name} (x${i.quantity})`).join(', '));
            result = result.replace(/{{first_item}}/g, order.items[0].name);
        }
        else {
            result = result.replace(/{{item_list}}/g, 'your items');
            result = result.replace(/{{first_item}}/g, 'your item');
        }
    }
    else {
        // Default placeholders when no order data
        result = result.replace(/{{order_number}}/g, '[order number]');
        result = result.replace(/{{order_status}}/g, '[status]');
        result = result.replace(/{{tracking_number}}/g, '[tracking number]');
        result = result.replace(/{{carrier}}/g, 'the carrier');
        result = result.replace(/{{estimated_delivery}}/g, '[delivery date]');
        result = result.replace(/{{order_total}}/g, '[amount]');
        result = result.replace(/{{item_list}}/g, 'your items');
        result = result.replace(/{{first_item}}/g, 'your item');
    }
    return result;
}
// ============ DELAYED ORDER TEMPLATES ============
const DELAYED_PROFESSIONAL = {
    issueType: 'delayed',
    name: 'Delayed Order - Professional',
    tone: 'professional',
    template: `Dear {{customer_name}},

Thank you for contacting us regarding order #{{order_number}}.

I understand your concern about the delivery delay. According to our records, your order is currently {{order_status}} with {{carrier}}. The tracking number is {{tracking_number}}, and the estimated delivery is {{estimated_delivery}}.

We apologize for any inconvenience this delay may have caused. If your order doesn't arrive by the estimated date, please don't hesitate to reach out, and we'll investigate further with the carrier.

Is there anything else I can assist you with today?

Best regards`,
    suggestedActions: ['track_order', 'contact_carrier', 'offer_discount'],
};
const DELAYED_EMPATHETIC = {
    issueType: 'delayed',
    name: 'Delayed Order - Empathetic',
    tone: 'empathetic',
    template: `Hi {{customer_first_name}},

I'm so sorry to hear your order hasn't arrived yet – I completely understand how frustrating that must be, especially when you're looking forward to receiving {{item_list}}.

I've looked into order #{{order_number}}, and I can see it's currently {{order_status}}. Your tracking number is {{tracking_number}}, and it should arrive by {{estimated_delivery}}.

I know delays are never fun. If it doesn't arrive by then, please let me know immediately and I'll personally escalate this with our shipping team to get you answers.

Is there anything else I can do to help make this right?

Warmly`,
    suggestedActions: ['track_order', 'expedite_shipping', 'offer_discount', 'escalate'],
};
// ============ DAMAGED ITEM TEMPLATES ============
const DAMAGED_PROFESSIONAL = {
    issueType: 'damaged',
    name: 'Damaged Item - Professional',
    tone: 'professional',
    template: `Dear {{customer_name}},

Thank you for bringing this to our attention regarding order #{{order_number}}.

I sincerely apologize that {{first_item}} arrived damaged. This is not the quality we strive to deliver, and I understand how disappointing this must be.

I'd like to resolve this for you right away. We have the following options:

1. Send a replacement item at no additional cost
2. Process a full refund for the damaged item
3. Offer store credit plus a 15% bonus for the inconvenience

Please let me know which option works best for you. If you could share a photo of the damage, it will help us process your request faster and improve our packaging.

Best regards`,
    suggestedActions: ['send_replacement', 'process_refund', 'offer_store_credit', 'request_photo'],
};
const DAMAGED_EMPATHETIC = {
    issueType: 'damaged',
    name: 'Damaged Item - Empathetic',
    tone: 'empathetic',
    template: `Hi {{customer_first_name}},

Oh no, I'm really sorry to hear that {{first_item}} arrived damaged! That's definitely not the experience we want for you.

I can only imagine how disappointing it was to open your package and find it in that condition. Please know that we take this seriously and I want to make it right for you.

Here's what I can do:
• Ship out a brand new replacement today – on us, of course
• Or if you prefer, I can process a full refund right away
• We can also do store credit with an extra 15% for the trouble

Just let me know what works best for you! And if you can snap a quick photo of the damage, that would help us figure out what went wrong so we can prevent this from happening again.

I'm here to help!`,
    suggestedActions: ['send_replacement', 'process_refund', 'offer_store_credit', 'request_photo'],
};
// ============ WRONG ITEM TEMPLATES ============
const WRONG_ITEM_PROFESSIONAL = {
    issueType: 'wrong_item',
    name: 'Wrong Item - Professional',
    tone: 'professional',
    template: `Dear {{customer_name}},

Thank you for contacting us about order #{{order_number}}.

I apologize for the mix-up with your order. I understand you received the wrong item instead of {{first_item}}, and I can assure you we will resolve this promptly.

Here's what we'll do:
1. Ship the correct item to you immediately at no cost
2. Provide a prepaid return label for the incorrect item
3. You're welcome to keep or donate the wrong item if you prefer

The replacement will be sent via expedited shipping to get it to you as quickly as possible.

Please confirm your shipping address and I'll have this processed within the hour.

Best regards`,
    suggestedActions: ['send_correct_item', 'generate_return_label', 'expedite_shipping'],
};
// ============ REFUND REQUEST TEMPLATES ============
const REFUND_PROFESSIONAL = {
    issueType: 'refund_request',
    name: 'Refund Request - Professional',
    tone: 'professional',
    template: `Dear {{customer_name}},

Thank you for reaching out regarding order #{{order_number}}.

I've reviewed your refund request for {{order_total}}. I'd be happy to assist you with this.

To proceed with the refund, I'll need to confirm a few details:
- Has the item been returned, or would you like a return label?
- Would you prefer the refund to your original payment method or as store credit?

Once confirmed, refunds typically process within 3-5 business days and will appear on your statement within 1-2 billing cycles.

Please let me know how you'd like to proceed.

Best regards`,
    suggestedActions: ['process_refund', 'generate_return_label', 'offer_store_credit', 'check_return_status'],
};
const REFUND_EMPATHETIC = {
    issueType: 'refund_request',
    name: 'Refund Request - Empathetic',
    tone: 'empathetic',
    template: `Hi {{customer_first_name}},

I understand you'd like a refund for order #{{order_number}}, and I'm here to help make this as smooth as possible.

Before I process this, I just want to check – is there anything we could do differently? I'd hate to lose you as a customer, and if there's an issue we can fix, I'd love the chance to make it right.

That said, I completely respect your decision either way. Just let me know:
• Should I send a prepaid return label?
• Do you want the {{order_total}} back to your card or as store credit (plus a little bonus)?

I'll get this sorted for you right away!

Warmly`,
    suggestedActions: ['process_refund', 'offer_alternative', 'generate_return_label', 'offer_store_credit'],
};
// ============ TRACKING TEMPLATES ============
const TRACKING_FRIENDLY = {
    issueType: 'tracking',
    name: 'Order Tracking - Friendly',
    tone: 'friendly',
    template: `Hi {{customer_first_name}}!

Great news – I found your order #{{order_number}}! 📦

Here's the scoop:
• Status: {{order_status}}
• Carrier: {{carrier}}
• Tracking Number: {{tracking_number}}
• Expected Delivery: {{estimated_delivery}}

You can track your package in real-time here: [tracking link]

Let me know if you need anything else – happy to help!

Cheers`,
    suggestedActions: ['share_tracking_link', 'contact_carrier'],
};
// ============ RETURN REQUEST TEMPLATES ============
const RETURN_PROFESSIONAL = {
    issueType: 'return_request',
    name: 'Return Request - Professional',
    tone: 'professional',
    template: `Dear {{customer_name}},

Thank you for contacting us about returning items from order #{{order_number}}.

I'd be happy to assist with your return. Our return policy allows returns within 30 days of delivery for items in original condition.

To start your return:
1. I'll email you a prepaid return label
2. Pack the item securely in its original packaging if possible
3. Drop it off at any {{carrier}} location
4. Once received, your refund will process within 3-5 business days

Would you like me to send the return label to your email on file?

Best regards`,
    suggestedActions: ['generate_return_label', 'check_return_eligibility', 'process_exchange'],
};
// ============ CANCELLATION TEMPLATES ============
const CANCELLATION_PROFESSIONAL = {
    issueType: 'cancellation',
    name: 'Cancellation Request - Professional',
    tone: 'professional',
    template: `Dear {{customer_name}},

Thank you for reaching out about order #{{order_number}}.

I've checked the status of your order, and [ORDER_STATUS_CHECK].

[IF_CAN_CANCEL: I've successfully cancelled your order. The refund of {{order_total}} will be processed within 3-5 business days.]

[IF_SHIPPED: Unfortunately, this order has already shipped and cannot be cancelled. However, I can help you set up a return once it arrives – we'll provide a prepaid label at no cost to you.]

Is there anything else I can help you with?

Best regards`,
    suggestedActions: ['cancel_order', 'process_refund', 'generate_return_label'],
};
// ============ TEMPLATE REGISTRY ============
export const ORDER_RESPONSE_TEMPLATES = {
    delayed: [DELAYED_PROFESSIONAL, DELAYED_EMPATHETIC],
    damaged: [DAMAGED_PROFESSIONAL, DAMAGED_EMPATHETIC],
    wrong_item: [WRONG_ITEM_PROFESSIONAL],
    missing_item: [WRONG_ITEM_PROFESSIONAL], // Reuse wrong item template
    refund_request: [REFUND_PROFESSIONAL, REFUND_EMPATHETIC],
    cancellation: [CANCELLATION_PROFESSIONAL],
    tracking: [TRACKING_FRIENDLY],
    delivery_issue: [DELAYED_PROFESSIONAL, DELAYED_EMPATHETIC],
    return_request: [RETURN_PROFESSIONAL],
};
/**
 * Get templates for a specific issue type
 */
export function getTemplatesForIssue(issueType) {
    return ORDER_RESPONSE_TEMPLATES[issueType] || [];
}
/**
 * Get template by issue type and tone
 */
export function getTemplateByTone(issueType, tone) {
    const templates = ORDER_RESPONSE_TEMPLATES[issueType];
    return templates?.find(t => t.tone === tone) || templates?.[0];
}
/**
 * Get all available quick actions for issue type
 */
export function getQuickActionsForIssue(issueType) {
    const templates = ORDER_RESPONSE_TEMPLATES[issueType];
    if (!templates || templates.length === 0)
        return [];
    // Collect unique actions from all templates
    const actions = new Set();
    templates.forEach(t => t.suggestedActions.forEach(a => actions.add(a)));
    return Array.from(actions);
}
export default {
    ORDER_RESPONSE_TEMPLATES,
    getTemplatesForIssue,
    getTemplateByTone,
    getQuickActionsForIssue,
    hydrateTemplate,
};
