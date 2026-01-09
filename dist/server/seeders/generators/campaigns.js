import { emailCampaigns, emailTemplates } from "../../../drizzle/schema";
const campaignData = [
    {
        name: "Spring Collection Launch",
        subject: "🌸 Spring Refresh: New Collection Just Dropped",
        previewText: "Transform your space with our latest spring designs. Shop now for 15% off!",
        type: "product_launch",
        daysAgo: 85,
        status: "sent",
        openRateRange: [0.26, 0.30],
        clickRateRange: [0.06, 0.08]
    },
    {
        name: "Black Friday Sale",
        subject: "🔥 BLACK FRIDAY: 60% Off Sitewide + Free Shipping",
        previewText: "Our biggest sale of the year is here! Don't miss these incredible deals.",
        type: "seasonal",
        daysAgo: 68,
        status: "sent",
        openRateRange: [0.36, 0.40],
        clickRateRange: [0.10, 0.14]
    },
    {
        name: "Weekly Newsletter - Design Tips",
        subject: "5 Ways to Make Your Living Room Feel Bigger",
        previewText: "Plus: Behind the scenes of our latest collection and a special offer.",
        type: "newsletter",
        daysAgo: 52,
        status: "sent",
        openRateRange: [0.21, 0.25],
        clickRateRange: [0.02, 0.04]
    },
    {
        name: "Cyber Monday Extended",
        subject: "⏰ EXTENDED: Cyber Monday Deals End Tonight!",
        previewText: "Final hours to save up to 50% on your favorite pieces. Free shipping!",
        type: "promotional",
        daysAgo: 65,
        status: "sent",
        openRateRange: [0.31, 0.35],
        clickRateRange: [0.08, 0.10]
    },
    {
        name: "We Miss You - Come Back",
        subject: "We noticed you've been away... here's 25% off",
        previewText: "It's been a while! We'd love to see you again. Enjoy 25% off your next purchase.",
        type: "re_engagement",
        daysAgo: 45,
        status: "sent",
        openRateRange: [0.16, 0.20],
        clickRateRange: [0.10, 0.15]
    },
    {
        name: "Holiday Gift Guide 2025",
        subject: "🎁 The Ultimate Holiday Gift Guide for Home Lovers",
        previewText: "Find the perfect gifts for everyone on your list. Curated collections starting at $29.",
        type: "seasonal",
        daysAgo: 38,
        status: "sent",
        openRateRange: [0.31, 0.35],
        clickRateRange: [0.08, 0.10]
    },
    {
        name: "New Year Sale - 30% Off Furniture",
        subject: "New Year Sale: 30% Off All Furniture + Free Design Consultation",
        previewText: "Start 2026 with a fresh look. Save big on sofas, tables, chairs, and more.",
        type: "seasonal",
        daysAgo: 28,
        status: "sent",
        openRateRange: [0.30, 0.34],
        clickRateRange: [0.07, 0.09]
    },
    {
        name: "Customer Favorites - Top 10",
        subject: "Our Customers' Top 10 Favorite Products",
        previewText: "See what everyone's loving this season. Plus, get styling tips for each piece.",
        type: "newsletter",
        daysAgo: 21,
        status: "sent",
        openRateRange: [0.23, 0.27],
        clickRateRange: [0.03, 0.05]
    },
    {
        name: "Valentine's Day Sale",
        subject: "💕 Valentine's Day: 20% Off Romantic Home Accents",
        previewText: "Create a cozy, romantic atmosphere with our curated Valentine's collection.",
        type: "seasonal",
        daysAgo: 14,
        status: "sent",
        openRateRange: [0.28, 0.32],
        clickRateRange: [0.06, 0.08]
    },
    {
        name: "Flash Sale - 24 Hours Only",
        subject: "⚡ FLASH SALE: 40% Off for 24 Hours Only!",
        previewText: "Don't wait! This incredible offer expires tomorrow at midnight.",
        type: "promotional",
        daysAgo: 7,
        status: "sent",
        openRateRange: [0.32, 0.36],
        clickRateRange: [0.07, 0.09]
    },
    {
        name: "Weekly Newsletter - Spring Trends",
        subject: "Top 5 Spring Decorating Trends You Need to Know",
        previewText: "Get inspired by the latest design trends and shop the look.",
        type: "newsletter",
        daysAgo: 3,
        status: "sent",
        openRateRange: [0.20, 0.24],
        clickRateRange: [0.02, 0.04]
    },
    {
        name: "VIP Early Access - Coastal Collection",
        subject: "🌟 VIP Early Access: New Coastal Collection",
        previewText: "You're invited to shop our new collection 48 hours before everyone else.",
        type: "product_launch",
        daysAgo: 1,
        status: "sent",
        openRateRange: [0.28, 0.32],
        clickRateRange: [0.07, 0.09]
    },
    {
        name: "Abandoned Cart Recovery",
        subject: "You left something behind... Plus, here's 10% off!",
        previewText: "Complete your order now and save 10% on your cart.",
        type: "automated",
        daysAgo: 0,
        status: "scheduled",
        openRateRange: [0, 0],
        clickRateRange: [0, 0]
    },
    {
        name: "Spring Clearance - Winter Items",
        subject: "🌼 Spring Clearance: Winter Items Up to 70% Off",
        previewText: "Make room for spring! Huge savings on winter decor and furniture.",
        type: "promotional",
        daysAgo: 0,
        status: "draft",
        openRateRange: [0, 0],
        clickRateRange: [0, 0]
    },
    {
        name: "Customer Appreciation",
        subject: "Thank You for Being an Amazing Customer! 💙",
        previewText: "We appreciate your support. Here's a special gift just for you.",
        type: "newsletter",
        daysAgo: -3,
        status: "scheduled",
        openRateRange: [0, 0],
        clickRateRange: [0, 0]
    }
];
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
function daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}
export async function generateCampaigns(db, totalContacts = 2400) {
    console.log("Generating email campaigns...");
    // Create email templates first
    const templates = [
        {
            organizationId: 1,
            name: "Welcome Email",
            subject: "Welcome to {{companyName}}!",
            htmlContent: "<html><body><h1>Welcome {{firstName}}!</h1><p>We're excited to have you.</p></body></html>",
            textContent: "Welcome {{firstName}}! We're excited to have you.",
            category: "transactional",
            createdAt: daysAgo(180),
            updatedAt: daysAgo(180)
        },
        {
            organizationId: 1,
            name: "Promotional Email",
            subject: "{{subject}}",
            htmlContent: "<html><body><h1>{{headline}}</h1><p>{{content}}</p><a href='{{ctaUrl}}'>{{ctaText}}</a></body></html>",
            textContent: "{{headline}} - {{content}}",
            category: "marketing",
            createdAt: daysAgo(180),
            updatedAt: daysAgo(180)
        },
        {
            organizationId: 1,
            name: "Newsletter Template",
            subject: "{{subject}}",
            htmlContent: "<html><body><h1>{{title}}</h1><div>{{content}}</div></body></html>",
            textContent: "{{title}} - {{content}}",
            category: "marketing",
            createdAt: daysAgo(180),
            updatedAt: daysAgo(180)
        }
    ];
    await db.insert(emailTemplates).values(templates);
    // Create campaigns
    const campaigns = campaignData.map((campaign, index) => {
        const recipientCount = campaign.status === "draft" ? 0 :
            campaign.type === "product_launch" && campaign.daysAgo === 1 ? 180 :
                Math.round(totalContacts * (0.95 + Math.random() * 0.05));
        let sentCount = 0;
        let openCount = 0;
        let clickCount = 0;
        let bounceCount = 0;
        let unsubscribeCount = 0;
        if (campaign.status === "sent") {
            sentCount = recipientCount;
            const openRate = randomFloat(campaign.openRateRange[0], campaign.openRateRange[1]);
            const clickRate = randomFloat(campaign.clickRateRange[0], campaign.clickRateRange[1]);
            openCount = Math.round(sentCount * openRate);
            clickCount = Math.round(sentCount * clickRate);
            bounceCount = Math.round(sentCount * randomFloat(0.01, 0.03));
            unsubscribeCount = Math.round(sentCount * randomFloat(0.001, 0.003));
        }
        const createdDate = daysAgo(campaign.daysAgo + 2);
        const sentDate = campaign.status === "sent" ? daysAgo(campaign.daysAgo) : null;
        const scheduledDate = campaign.status === "scheduled" ? daysAgo(campaign.daysAgo) : null;
        return {
            organizationId: 1,
            name: campaign.name,
            subject: campaign.subject,
            preheader: campaign.previewText,
            htmlContent: `<html><body><h1>${campaign.subject}</h1><p>${campaign.previewText}</p></body></html>`,
            textContent: `${campaign.subject}\n\n${campaign.previewText}`,
            segmentId: null,
            status: campaign.status,
            scheduledAt: scheduledDate,
            sentAt: sentDate,
            recipientCount,
            openCount,
            clickCount,
            bounceCount,
            unsubscribeCount,
            createdBy: 1, // Demo user
            createdAt: createdDate,
            updatedAt: sentDate || createdDate
        };
    });
    await db.insert(emailCampaigns).values(campaigns);
    console.log(`✓ Created ${campaigns.length} campaigns and ${templates.length} templates`);
    return campaigns;
}
