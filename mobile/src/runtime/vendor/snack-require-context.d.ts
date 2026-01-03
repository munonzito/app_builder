export function pathIsVirtualModule(uri: string): boolean;
export function sanitizeFilePath(uri: string): string;
export function convertVirtualModulePathToRequest(contextUri: string): any;
export function resolveContextFiles(contextRequest: any, files: string[]): Record<string, string>;
export function createContextModuleTemplate(contextFiles: Record<string, string>): string;
export function createVirtualModulePath(options: { directory: string }): string;
export const snackRequireContextVirtualModuleBabelPlugin: any;
