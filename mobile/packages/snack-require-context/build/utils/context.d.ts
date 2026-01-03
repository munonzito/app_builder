/** @see https://webpack.js.org/guides/dependency-management/#requirecontext */
export type SnackRequireContextRequest = {
    /** The "target" directory of the `require.context`, relative from root */
    directory: string;
    /** If all nested files within the directory should be requested */
    isRecursive: boolean;
    /** The regular expression used to select files */
    matching: RegExp;
    /** If the modules should be loaded synchronously, or asynchronously */
    mode: 'sync' | 'async';
};
export type SnackRequireContext<Module = any> = {
    /** Load a module from the requested context */
    (module: string): Module;
    /** Get all modules from the requested context. */
    keys(): string[];
    /** Resolve a module id, instead of the module itself, from the requested context */
    resolve(module: string): string;
};
/**
 * Determine if a module path is a virtual module containing the `require.context` result.
 */
export declare function pathIsVirtualModule(modulePath: string): boolean;
/**
 * Create the path of a virtual module that represents a `require.context` result.
 * This embeds the context options into a base64 encoded query string, to evaluate inside the Snack Runtime.
 */
export declare function createVirtualModulePath(request: Omit<Partial<SnackRequireContextRequest>, 'directory'> & Pick<SnackRequireContextRequest, 'directory'>): string;
/**
 * Reconstruct the context request from a virtual module path.
 * This decodes the base64 query string and loads the directory from the path.
 */
export declare function convertVirtualModulePathToRequest(modulePath: string): SnackRequireContextRequest;
/**
 * Resolve the requested context from existing Snack Runtime files.
 * This returns an object of modules that match the requested context.
 * Keys in this object are relative to the context directory, while values are relative to root.
 */
export declare function resolveContextFiles(request: SnackRequireContextRequest, files: string[]): Record<string, string>;
/**
 * Resolve the requested `require.context` directory, relative from root.
 * This requires the full file path of the file in which it was requested.
 */
export declare function resolveContextDirectory(filePath: string, requestedDir: string): string;
/**
 * Create a virtual module that represents the code for `require.context()`.
 * All paths MUST be relative from root.
 */
export declare function createContextModuleTemplate(moduleMap: Record<string, string>): string;
export declare function createEmptyContextModuleTemplate(): string;
