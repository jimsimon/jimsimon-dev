import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/connection.js';
import { users } from '../database/schema.js';
import { eq } from 'drizzle-orm';

export interface AuthContext extends Context {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

export async function authMiddleware(ctx: AuthContext, next: Next): Promise<void> {
  const authHeader = ctx.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // For development, accept the simple admin-token
      if (token === 'admin-token') {
        const db = getDatabase();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, 'jim.j.simon@gmail.com'))
          .limit(1);
        
        if (user) {
          ctx.user = user;
        }
      } else {
        // JWT token validation
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const db = getDatabase();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);
        
        if (user) {
          ctx.user = user;
        }
      }
    } catch (error) {
      // Invalid token, continue without user
    }
  }
  
  await next();
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

export async function requireAuth(ctx: AuthContext, next: Next): Promise<void> {
  if (!ctx.user) {
    ctx.status = 401;
    ctx.body = { error: 'Authentication required' };
    return;
  }
  await next();
}

export async function requireAdmin(ctx: AuthContext, next: Next): Promise<void> {
  if (!ctx.user || ctx.user.role !== 'admin') {
    ctx.status = 403;
    ctx.body = { error: 'Admin access required' };
    return;
  }
  await next();
}