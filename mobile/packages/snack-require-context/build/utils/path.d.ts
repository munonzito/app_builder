/**
 * Sanitize a file path from Babel or Snack Runtime.
 * This removes any leading `/`, `./`, or `module://` prefixes.
 */
export declare function sanitizeFilePath(filePath: string): string;
