import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If we are in the REST API context, we might have X-SMA-API-Key handling already,
  // but this middleware is for the main app/auth routes.
  // Check cookie or header
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    // If no token, we can still proceed but user is null (optional auth)
    // Or return 401 if strict. For now, let's follow the prompt which implies strictness for this middleware?
    // "if (!token) { return res.status(401)... }"
    // However, context.ts logic handles optional auth.
    // Let's implement strict validation as requested, but maybe only apply it to protected routes.
    // The prompt says: "Replace Manus auth with simple JWT" and shows the code.
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
