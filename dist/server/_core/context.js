import jwt from 'jsonwebtoken';
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
export async function createContext(opts) {
    let user = null;
    try {
        const token = opts.req.headers.authorization?.split(' ')[1] || (opts.req.cookies ? opts.req.cookies.token : null);
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
            if (decoded && decoded.id) {
                // Optionally fetch full user from DB if needed, or use decoded data
                const db = await getDb();
                if (db) {
                    const dbUser = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
                    if (dbUser.length > 0) {
                        user = dbUser[0];
                    }
                }
            }
        }
    }
    catch (error) {
        // Authentication is optional for public procedures.
        user = null;
    }
    return {
        req: opts.req,
        res: opts.res,
        user,
    };
}
