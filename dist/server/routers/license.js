import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { licenseService } from "../services/licensing/licenseService";
export const licenseRouter = router({
    // Activate a license key
    activate: protectedProcedure
        .input(z.object({ key: z.string().min(5) }))
        .mutation(async ({ ctx, input }) => {
        const orgId = ctx.user.organizationId || 1; // Fallback or need to fetch org
        // TODO: Proper multi-tenant context extraction
        return await licenseService.activateLicense(orgId, input.key);
    }),
    // Get current status
    getStatus: protectedProcedure
        .query(async ({ ctx }) => {
        const orgId = ctx.user.organizationId || 1; // Fallback
        // Check access (validates status against DB)
        const hasAccess = await licenseService.checkAccess(orgId);
        // We could also fetch the plan details here if we extended the service
        // For now, we return a simple status object
        return {
            active: hasAccess,
            status: hasAccess ? "Active" : "Inactive",
        };
    }),
});
