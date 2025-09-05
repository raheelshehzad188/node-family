import { Router } from 'express';
import jwt from 'jsonwebtoken';
type Role = 'admin' | 'subadmin';
type AuthJwtPayload = jwt.JwtPayload & { role: Role; sub: string };
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const TOKEN_TTL = process.env.JWT_TTL || '1d';

// In-memory user store placeholder. Replace with DB in production.
const users = new Map<string, { passwordHash: string; role: 'admin' | 'subadmin' }>();

// Seed admin if env present
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  const email = process.env.ADMIN_EMAIL.toLowerCase();
  const passwordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  users.set(email, { passwordHash, role: 'admin' });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  const { email, password } = parse.data;
  const normalized = email.toLowerCase();
  const user = users.get(normalized);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: normalized, role: user.role } as AuthJwtPayload, JWT_SECRET as jwt.Secret, {
    expiresIn: TOKEN_TTL as unknown as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
  res.json({ token, role: user.role });
});

export const requireRole = (roles: Array<'admin' | 'subadmin'>) => {
  return (req: any, res: any, next: any) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    try {
      const payload = jwt.verify(token, JWT_SECRET as jwt.Secret) as AuthJwtPayload;
      if (!payload || typeof payload !== 'object' || !('role' in (payload as any))) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (!roles.includes((payload as any).role)) return res.status(403).json({ error: 'Forbidden' });
      (req as any).user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

