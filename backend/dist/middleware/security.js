"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSecurityMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const registerSecurityMiddleware = (app) => {
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 1000,
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);
};
exports.registerSecurityMiddleware = registerSecurityMiddleware;
