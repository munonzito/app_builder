"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeFilePath = void 0;
/**
 * Sanitize a file path from Babel or Snack Runtime.
 * This removes any leading `/`, `./`, or `module://` prefixes.
 */
function sanitizeFilePath(filePath) {
    // Remove starting `/`, `./`, or `module://` prefixes
    return filePath.replace(/^(module:\/{1,2}|\.?\/)/, '');
}
exports.sanitizeFilePath = sanitizeFilePath;
//# sourceMappingURL=path.js.map