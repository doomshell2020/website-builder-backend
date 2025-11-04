"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clear = exports.del = exports.get = exports.set = void 0;
// src/utils/cache.util.ts
const keyv_1 = __importDefault(require("keyv"));
const keyv = new keyv_1.default();
const set = (key, value, ttl) => {
    return keyv.set(key, value, ttl);
};
exports.set = set;
const get = (key) => {
    return keyv.get(key);
};
exports.get = get;
const del = (key) => {
    return keyv.delete(key);
};
exports.del = del;
const clear = () => {
    return keyv.clear();
};
exports.clear = clear;
