/**
 * Comprehensive Workflow Templates Library
 *
 * Industry-specific automation sequences for different business types.
 * Each template includes complete workflow configuration with steps, delays, and conditions.
 */
export const workflowTemplates = [
    // ==================== E-COMMERCE TEMPLATES ====================
    {
        id: 'ecom-abandoned-cart-recovery',
        name: 'Abandoned Cart Recovery',
        description: 'Recover lost sales with a 3-email sequence sent 1 hour, 24 hours, and 3 days after cart abandonment',
        category: 'ecommerce',
        tags: ['cart', 'recovery', 'sales'],
        icon: '🛒',
        triggerType: 'abandoned_cart',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'You left something behind...',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>We noticed you left items in your cart. Complete your purchase now!</p><p><a href="{{cart.url}}">View Cart</a></p>',
                    textBody: 'Hi {{contact.firstName}}, We noticed you left items in your cart. Complete your purchase now! {{cart.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 23,
                    unit: 'hours',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Still interested? Here\'s 10% off!',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Your cart is waiting! Use code SAVE10 for 10% off.</p><p><a href="{{cart.url}}">Complete Purchase</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Your cart is waiting! Use code SAVE10 for 10% off. {{cart.url}}',
                },
            },
            {
                id: 'delay-2',
                type: 'delay',
                config: {
                    amount: 2,
                    unit: 'days',
                },
            },
            {
                id: 'email-3',
                type: 'email',
                config: {
                    subject: 'Last chance: Your cart expires soon',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>This is your last reminder! Your cart items are selling fast.</p><p><a href="{{cart.url}}">Shop Now</a></p>',
                    textBody: 'Hi {{contact.firstName}}, This is your last reminder! Your cart items are selling fast. {{cart.url}}',
                },
            },
        ],
    },
    {
        id: 'ecom-post-purchase-review',
        name: 'Post-Purchase Review Request',
        description: 'Request product reviews 7 days after delivery with a follow-up reminder',
        category: 'ecommerce',
        tags: ['review', 'feedback', 'post-purchase'],
        icon: '⭐',
        triggerType: 'shipping',
        steps: [
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 7,
                    unit: 'days',
                },
            },
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'How are you enjoying your purchase?',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>We hope you\'re loving your recent purchase! Would you mind sharing your experience?</p><p><a href="{{review.url}}">Leave a Review</a></p>',
                    textBody: 'Hi {{contact.firstName}}, We hope you\'re loving your recent purchase! Would you mind sharing your experience? {{review.url}}',
                },
            },
            {
                id: 'delay-2',
                type: 'delay',
                config: {
                    amount: 5,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Quick reminder: Share your feedback',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>We\'d love to hear what you think about your order! Your feedback helps us improve.</p><p><a href="{{review.url}}">Write Review</a></p>',
                    textBody: 'Hi {{contact.firstName}}, We\'d love to hear what you think about your order! Your feedback helps us improve. {{review.url}}',
                },
            },
        ],
    },
    {
        id: 'ecom-back-in-stock',
        name: 'Back in Stock Notification',
        description: 'Notify customers when out-of-stock products become available again',
        category: 'ecommerce',
        tags: ['inventory', 'notification', 'restock'],
        icon: '📦',
        triggerType: 'custom',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'Good news! {{product.name}} is back in stock',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>The item you were waiting for is back! Get it before it sells out again.</p><p><a href="{{product.url}}">Shop Now</a></p>',
                    textBody: 'Hi {{contact.firstName}}, The item you were waiting for is back! Get it before it sells out again. {{product.url}}',
                },
            },
        ],
    },
    {
        id: 'ecom-win-back',
        name: 'Win-Back Campaign',
        description: 'Re-engage inactive customers who haven\'t purchased in 90 days with special offers',
        category: 'ecommerce',
        tags: ['retention', 'win-back', 'reactivation'],
        icon: '💝',
        triggerType: 'custom',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'We miss you! Here\'s 20% off your next order',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>It\'s been a while! We\'d love to see you back. Enjoy 20% off with code WELCOME20.</p><p><a href="{{store.url}}">Start Shopping</a></p>',
                    textBody: 'Hi {{contact.firstName}}, It\'s been a while! We\'d love to see you back. Enjoy 20% off with code WELCOME20. {{store.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 7,
                    unit: 'days',
                },
            },
            {
                id: 'condition-1',
                type: 'condition',
                config: {
                    field: 'order.count',
                    operator: 'equals',
                    value: '0',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Last chance: Your 20% discount expires soon',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Your exclusive 20% discount expires in 3 days. Don\'t miss out!</p><p><a href="{{store.url}}">Shop Now</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Your exclusive 20% discount expires in 3 days. Don\'t miss out! {{store.url}}',
                },
            },
        ],
    },
    // ==================== SAAS TEMPLATES ====================
    {
        id: 'saas-onboarding-sequence',
        name: 'SaaS Onboarding Sequence',
        description: 'Guide new users through product setup with a 5-email educational series',
        category: 'saas',
        tags: ['onboarding', 'education', 'activation'],
        icon: '🚀',
        triggerType: 'welcome',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'Welcome to {{app.name}}! Let\'s get started',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Welcome aboard! Here\'s how to get the most out of {{app.name}} in your first week.</p><p><a href="{{app.url}}/getting-started">Get Started</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Welcome aboard! Here\'s how to get the most out of {{app.name}} in your first week. {{app.url}}/getting-started',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 2,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Quick tip: Your first {{feature.name}}',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Ready to create your first {{feature.name}}? This 2-minute tutorial will show you how.</p><p><a href="{{tutorial.url}}">Watch Tutorial</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Ready to create your first {{feature.name}}? This 2-minute tutorial will show you how. {{tutorial.url}}',
                },
            },
            {
                id: 'delay-2',
                type: 'delay',
                config: {
                    amount: 3,
                    unit: 'days',
                },
            },
            {
                id: 'email-3',
                type: 'email',
                config: {
                    subject: 'Pro tip: Advanced features you\'ll love',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Now that you\'re familiar with the basics, check out these powerful features.</p><p><a href="{{features.url}}">Explore Features</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Now that you\'re familiar with the basics, check out these powerful features. {{features.url}}',
                },
            },
            {
                id: 'delay-3',
                type: 'delay',
                config: {
                    amount: 5,
                    unit: 'days',
                },
            },
            {
                id: 'email-4',
                type: 'email',
                config: {
                    subject: 'How can we help you succeed?',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>You\'ve been with us for 10 days! How\'s everything going? We\'re here to help.</p><p><a href="{{support.url}}">Get Support</a></p>',
                    textBody: 'Hi {{contact.firstName}}, You\'ve been with us for 10 days! How\'s everything going? We\'re here to help. {{support.url}}',
                },
            },
        ],
    },
    {
        id: 'saas-trial-expiration',
        name: 'Trial Expiration Series',
        description: 'Convert trial users to paid customers with reminders at 7, 3, and 1 day before expiration',
        category: 'saas',
        tags: ['trial', 'conversion', 'upgrade'],
        icon: '⏰',
        triggerType: 'custom',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'Your trial ends in 7 days',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>You have 7 days left in your trial. Upgrade now to keep all your data and settings.</p><p><a href="{{upgrade.url}}">View Plans</a></p>',
                    textBody: 'Hi {{contact.firstName}}, You have 7 days left in your trial. Upgrade now to keep all your data and settings. {{upgrade.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 4,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Only 3 days left in your trial',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Your trial expires in 3 days. Don\'t lose access to your work!</p><p><a href="{{upgrade.url}}">Upgrade Now</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Your trial expires in 3 days. Don\'t lose access to your work! {{upgrade.url}}',
                },
            },
            {
                id: 'delay-2',
                type: 'delay',
                config: {
                    amount: 2,
                    unit: 'days',
                },
            },
            {
                id: 'email-3',
                type: 'email',
                config: {
                    subject: 'Last day: Your trial expires tomorrow',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>This is your final reminder! Your trial ends tomorrow. Upgrade to continue.</p><p><a href="{{upgrade.url}}">Choose Your Plan</a></p>',
                    textBody: 'Hi {{contact.firstName}}, This is your final reminder! Your trial ends tomorrow. Upgrade to continue. {{upgrade.url}}',
                },
            },
        ],
    },
    {
        id: 'saas-feature-adoption',
        name: 'Feature Adoption Campaign',
        description: 'Encourage users to try underutilized features with educational content',
        category: 'saas',
        tags: ['engagement', 'features', 'education'],
        icon: '✨',
        triggerType: 'custom',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'You\'re missing out on {{feature.name}}',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Did you know about {{feature.name}}? It can save you hours each week!</p><p><a href="{{feature.url}}">Learn More</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Did you know about {{feature.name}}? It can save you hours each week! {{feature.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 3,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Case study: How {{customer.name}} uses {{feature.name}}',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>See how {{customer.name}} transformed their workflow with {{feature.name}}.</p><p><a href="{{case_study.url}}">Read Case Study</a></p>',
                    textBody: 'Hi {{contact.firstName}}, See how {{customer.name}} transformed their workflow with {{feature.name}}. {{case_study.url}}',
                },
            },
        ],
    },
    {
        id: 'saas-churn-prevention',
        name: 'Churn Prevention Campaign',
        description: 'Re-engage inactive users before they cancel with personalized outreach',
        category: 'saas',
        tags: ['retention', 'churn', 'engagement'],
        icon: '🔄',
        triggerType: 'custom',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'We noticed you haven\'t logged in recently',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>We haven\'t seen you in a while. Is everything okay? We\'re here to help!</p><p><a href="{{support.url}}">Contact Support</a></p>',
                    textBody: 'Hi {{contact.firstName}}, We haven\'t seen you in a while. Is everything okay? We\'re here to help! {{support.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 5,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Can we help you get more value from {{app.name}}?',
                    fromName: '{{app.name}} Team',
                    fromEmail: 'hello@yourapp.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Let\'s schedule a quick call to make sure you\'re getting the most out of {{app.name}}.</p><p><a href="{{calendar.url}}">Book a Call</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Let\'s schedule a quick call to make sure you\'re getting the most out of {{app.name}}. {{calendar.url}}',
                },
            },
        ],
    },
    // ==================== RETAIL TEMPLATES ====================
    {
        id: 'retail-seasonal-promo',
        name: 'Seasonal Promotion Campaign',
        description: 'Drive sales during seasonal events with a 3-email promotional sequence',
        category: 'retail',
        tags: ['promotion', 'seasonal', 'sales'],
        icon: '🎉',
        triggerType: 'custom',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: '{{season.name}} Sale: Early access for you!',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Get early access to our {{season.name}} sale! Shop now before it goes public.</p><p><a href="{{sale.url}}">Shop Sale</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Get early access to our {{season.name}} sale! Shop now before it goes public. {{sale.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 3,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Hurry! {{season.name}} sale ends in 3 days',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Don\'t miss out! Our {{season.name}} sale ends soon. Stock up on your favorites!</p><p><a href="{{sale.url}}">Shop Now</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Don\'t miss out! Our {{season.name}} sale ends soon. Stock up on your favorites! {{sale.url}}',
                },
            },
            {
                id: 'delay-2',
                type: 'delay',
                config: {
                    amount: 2,
                    unit: 'days',
                },
            },
            {
                id: 'email-3',
                type: 'email',
                config: {
                    subject: 'Final hours: {{season.name}} sale ends tonight!',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Last chance! Our {{season.name}} sale ends at midnight. Shop now or miss out!</p><p><a href="{{sale.url}}">Final Sale</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Last chance! Our {{season.name}} sale ends at midnight. Shop now or miss out! {{sale.url}}',
                },
            },
        ],
    },
    {
        id: 'retail-loyalty-program',
        name: 'Loyalty Program Engagement',
        description: 'Keep loyalty members engaged with points updates and exclusive offers',
        category: 'retail',
        tags: ['loyalty', 'rewards', 'engagement'],
        icon: '🏆',
        triggerType: 'custom',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'You\'ve earned {{points.amount}} points!',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Great news! You now have {{points.total}} points. Redeem them for rewards!</p><p><a href="{{rewards.url}}">View Rewards</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Great news! You now have {{points.total}} points. Redeem them for rewards! {{rewards.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 7,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'VIP exclusive: Double points this weekend',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>As a valued member, earn DOUBLE points on all purchases this weekend!</p><p><a href="{{store.url}}">Start Shopping</a></p>',
                    textBody: 'Hi {{contact.firstName}}, As a valued member, earn DOUBLE points on all purchases this weekend! {{store.url}}',
                },
            },
        ],
    },
    {
        id: 'retail-birthday-offer',
        name: 'Birthday Celebration Offer',
        description: 'Send personalized birthday wishes with a special discount',
        category: 'retail',
        tags: ['birthday', 'personalization', 'offer'],
        icon: '🎂',
        triggerType: 'custom',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'Happy Birthday, {{contact.firstName}}! 🎉',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Happy Birthday, {{contact.firstName}}!</p><p>Celebrate with 25% off your next purchase. Use code BDAY25 at checkout.</p><p><a href="{{store.url}}">Treat Yourself</a></p>',
                    textBody: 'Happy Birthday, {{contact.firstName}}! Celebrate with 25% off your next purchase. Use code BDAY25 at checkout. {{store.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 7,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Your birthday discount expires soon!',
                    fromName: 'Your Store',
                    fromEmail: 'hello@yourstore.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Don\'t forget to use your birthday discount! Code BDAY25 expires in 3 days.</p><p><a href="{{store.url}}">Shop Now</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Don\'t forget to use your birthday discount! Code BDAY25 expires in 3 days. {{store.url}}',
                },
            },
        ],
    },
    // ==================== SERVICE BUSINESS TEMPLATES ====================
    {
        id: 'service-appointment-reminder',
        name: 'Appointment Reminder Series',
        description: 'Reduce no-shows with reminders 7 days, 1 day, and 2 hours before appointments',
        category: 'services',
        tags: ['appointment', 'reminder', 'no-show'],
        icon: '📅',
        triggerType: 'custom',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'Upcoming appointment on {{appointment.date}}',
                    fromName: '{{business.name}}',
                    fromEmail: 'hello@yourbusiness.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>This is a reminder about your appointment on {{appointment.date}} at {{appointment.time}}.</p><p><a href="{{appointment.url}}">View Details</a></p>',
                    textBody: 'Hi {{contact.firstName}}, This is a reminder about your appointment on {{appointment.date}} at {{appointment.time}}. {{appointment.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 6,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Tomorrow: Your appointment at {{appointment.time}}',
                    fromName: '{{business.name}}',
                    fromEmail: 'hello@yourbusiness.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Your appointment is tomorrow at {{appointment.time}}. See you soon!</p><p><a href="{{appointment.url}}">Reschedule</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Your appointment is tomorrow at {{appointment.time}}. See you soon! {{appointment.url}}',
                },
            },
            {
                id: 'delay-2',
                type: 'delay',
                config: {
                    amount: 22,
                    unit: 'hours',
                },
            },
            {
                id: 'email-3',
                type: 'email',
                config: {
                    subject: 'In 2 hours: Your appointment reminder',
                    fromName: '{{business.name}}',
                    fromEmail: 'hello@yourbusiness.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Your appointment starts in 2 hours. We look forward to seeing you!</p>',
                    textBody: 'Hi {{contact.firstName}}, Your appointment starts in 2 hours. We look forward to seeing you!',
                },
            },
        ],
    },
    {
        id: 'service-feedback-request',
        name: 'Service Feedback Request',
        description: 'Collect customer feedback after service completion to improve quality',
        category: 'services',
        tags: ['feedback', 'review', 'satisfaction'],
        icon: '💬',
        triggerType: 'custom',
        steps: [
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 1,
                    unit: 'days',
                },
            },
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'How was your experience with us?',
                    fromName: '{{business.name}}',
                    fromEmail: 'hello@yourbusiness.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Thank you for choosing {{business.name}}! We\'d love to hear about your experience.</p><p><a href="{{feedback.url}}">Share Feedback</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Thank you for choosing {{business.name}}! We\'d love to hear about your experience. {{feedback.url}}',
                },
            },
            {
                id: 'delay-2',
                type: 'delay',
                config: {
                    amount: 5,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Quick reminder: We value your feedback',
                    fromName: '{{business.name}}',
                    fromEmail: 'hello@yourbusiness.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>We\'d still love to hear from you! Your feedback takes just 2 minutes.</p><p><a href="{{feedback.url}}">Leave Feedback</a></p>',
                    textBody: 'Hi {{contact.firstName}}, We\'d still love to hear from you! Your feedback takes just 2 minutes. {{feedback.url}}',
                },
            },
        ],
    },
    {
        id: 'service-referral-program',
        name: 'Referral Program Campaign',
        description: 'Encourage satisfied customers to refer friends with incentives',
        category: 'services',
        tags: ['referral', 'growth', 'incentive'],
        icon: '🤝',
        triggerType: 'custom',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'Share the love, get $50!',
                    fromName: '{{business.name}}',
                    fromEmail: 'hello@yourbusiness.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Love our service? Refer a friend and you\'ll both get $50 off your next visit!</p><p><a href="{{referral.url}}">Get Your Referral Link</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Love our service? Refer a friend and you\'ll both get $50 off your next visit! {{referral.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 14,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Your friends deserve great service too!',
                    fromName: '{{business.name}}',
                    fromEmail: 'hello@yourbusiness.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Know someone who could use our services? Share your referral link and earn rewards!</p><p><a href="{{referral.url}}">Share Now</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Know someone who could use our services? Share your referral link and earn rewards! {{referral.url}}',
                },
            },
        ],
    },
    // ==================== GENERAL TEMPLATES ====================
    {
        id: 'general-welcome-series',
        name: 'Welcome Series (3 emails)',
        description: 'Introduce new subscribers to your brand with a 3-email welcome sequence',
        category: 'general',
        tags: ['welcome', 'onboarding', 'introduction'],
        icon: '👋',
        triggerType: 'welcome',
        steps: [
            {
                id: 'email-1',
                type: 'email',
                config: {
                    subject: 'Welcome to {{business.name}}!',
                    fromName: '{{business.name}}',
                    fromEmail: 'hello@yourbusiness.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Welcome! We\'re thrilled to have you. Here\'s what you can expect from us.</p><p><a href="{{website.url}}">Learn More</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Welcome! We\'re thrilled to have you. Here\'s what you can expect from us. {{website.url}}',
                },
            },
            {
                id: 'delay-1',
                type: 'delay',
                config: {
                    amount: 2,
                    unit: 'days',
                },
            },
            {
                id: 'email-2',
                type: 'email',
                config: {
                    subject: 'Here\'s what makes us different',
                    fromName: '{{business.name}}',
                    fromEmail: 'hello@yourbusiness.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Discover what sets {{business.name}} apart and why customers love us.</p><p><a href="{{about.url}}">Our Story</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Discover what sets {{business.name}} apart and why customers love us. {{about.url}}',
                },
            },
            {
                id: 'delay-2',
                type: 'delay',
                config: {
                    amount: 3,
                    unit: 'days',
                },
            },
            {
                id: 'email-3',
                type: 'email',
                config: {
                    subject: 'Ready to get started?',
                    fromName: '{{business.name}}',
                    fromEmail: 'hello@yourbusiness.com',
                    htmlBody: '<p>Hi {{contact.firstName}},</p><p>Now that you know us better, let\'s get started! Here\'s how to take the next step.</p><p><a href="{{cta.url}}">Get Started</a></p>',
                    textBody: 'Hi {{contact.firstName}}, Now that you know us better, let\'s get started! Here\'s how to take the next step. {{cta.url}}',
                },
            },
        ],
    },
];
/**
 * Get templates by category
 */
export function getTemplatesByCategory(category) {
    return workflowTemplates.filter(t => t.category === category);
}
/**
 * Get template by ID
 */
export function getTemplateById(id) {
    return workflowTemplates.find(t => t.id === id);
}
/**
 * Search templates by tags
 */
export function searchTemplatesByTags(tags) {
    return workflowTemplates.filter(template => tags.some(tag => template.tags.includes(tag.toLowerCase())));
}
/**
 * Get all unique categories
 */
export function getAllCategories() {
    return ['ecommerce', 'saas', 'retail', 'services', 'general'];
}
/**
 * Get all unique tags
 */
export function getAllTags() {
    const tags = new Set();
    workflowTemplates.forEach(template => {
        template.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
}
