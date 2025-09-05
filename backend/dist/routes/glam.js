"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.glamRouter = void 0;
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const auth_1 = require("./auth");
const glamBaseUrl = process.env.GLAM_API_BASE_URL || 'https://api.glam.ai/api/v1';
const glamApiKey = process.env.GLAM_API_KEY || '';
const tryOnSchema = zod_1.z.object({
    mask_media_type: zod_1.z.enum(['overall', 'upper', 'lower']).default('overall'),
    user: zod_1.z.object({ url: zod_1.z.string().url() }),
    garment: zod_1.z.object({ url: zod_1.z.string().url() }),
    options: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
exports.glamRouter = (0, express_1.Router)();
exports.glamRouter.post('/tryon', (0, auth_1.requireRole)(['admin', 'subadmin']), async (req, res) => {
    if (!glamApiKey)
        return res.status(500).json({ error: 'GLAM_API_KEY missing' });
    const parse = tryOnSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid request' });
    try {
        const response = await axios_1.default.post(`${glamBaseUrl}/tryon`, {
            mask_media_type: parse.data.mask_media_type,
            user: parse.data.user,
            garment: parse.data.garment,
            options: parse.data.options,
        }, {
            headers: {
                'X-API-Key': glamApiKey,
                'Content-Type': 'application/json',
            },
            timeout: 60000,
        });
        res.json(response.data);
    }
    catch (err) {
        const status = err.response?.status || 500;
        res.status(status).json({ error: 'Glam API error', details: err.response?.data || err.message });
    }
});
exports.glamRouter.post('/beautify', (0, auth_1.requireRole)(['admin', 'subadmin']), async (req, res) => {
    if (!glamApiKey)
        return res.status(500).json({ error: 'GLAM_API_KEY missing' });
    try {
        const response = await axios_1.default.post(`${glamBaseUrl}/beautify`, req.body, {
            headers: { 'X-API-Key': glamApiKey, 'Content-Type': 'application/json' },
            timeout: 60000,
        });
        res.json(response.data);
    }
    catch (err) {
        const status = err.response?.status || 500;
        res.status(status).json({ error: 'Glam API error', details: err.response?.data || err.message });
    }
});
