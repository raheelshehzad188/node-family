"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("./utils/logger");
const security_1 = require("./middleware/security");
const auth_1 = require("./routes/auth");
const glam_1 = require("./routes/glam");
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
const app = (0, express_1.default)();
const logger = (0, logger_1.createLogger)();
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
(0, security_1.registerSecurityMiddleware)(app);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/auth', auth_1.authRouter);
app.use('/api/glam', glam_1.glamRouter);
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
});
