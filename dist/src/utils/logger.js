"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: 'error',
    format: winston_1.default.format.combine(winston_1.default.format.json(), winston_1.default.format.colorize()),
    transports: [
        new winston_1.default.transports.File({
            filename: 'error.log',
            level: 'error',
        }),
    ],
});
exports.logger = logger;
