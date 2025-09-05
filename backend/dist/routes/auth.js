"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const TOKEN_TTL = process.env.JWT_TTL || '1d';
// In-memory user store placeholder. Replace with DB in production.
const users = new Map();
// Seed admin if env present
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL.toLowerCase();
    const passwordHash = bcryptjs_1.default.hashSync(process.env.ADMIN_PASSWORD, 10);
    users.set(email, { passwordHash, role: 'admin' });
}
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/login', (req, res) => {
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
    const ok = bcryptjs_1.default.compareSync(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ sub: normalized, role: user.role }, JWT_SECRET, {
        expiresIn: TOKEN_TTL,
        algorithm: 'HS256',
    });
    res.json({ token, role: user.role });
});
const requireRole = (roles) => {
    return (req, res, next) => {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token)
            return res.status(401).json({ error: 'Missing token' });
        try {
            const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (!payload || typeof payload !== 'object' || !('role' in payload)) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            if (!roles.includes(payload.role))
                return res.status(403).json({ error: 'Forbidden' });
            req.user = payload;
            next();
        }
        catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
};
exports.requireRole = requireRole;
