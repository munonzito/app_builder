"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBase64 = exports.encodeBase64 = void 0;
const buffer_1 = require("buffer");
/** Convert any string to a URL-safe base64 string. */
function encodeBase64(value) {
    return buffer_1.Buffer.from(value)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
exports.encodeBase64 = encodeBase64;
/** Convert a URL-safe base64 string to its original value. */
function decodeBase64(value) {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    return buffer_1.Buffer.from(base64, 'base64').toString('utf-8');
}
exports.decodeBase64 = decodeBase64;
//# sourceMappingURL=base64.js.map