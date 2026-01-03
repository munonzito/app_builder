import type * as BabelCore from '@babel/core';
/**
 * Convert `require.context` statements to virtual modules `require(<vmodule>)`.
 * These virtual modules are resolved inside the Snack Runtime itself.
 * This Babel plugin is used in both Snackager (for libraries) and Snack Runtime (for user-provided code).
 */
export declare function snackRequireContextVirtualModuleBabelPlugin({ types, }: typeof BabelCore): BabelCore.PluginObj;
