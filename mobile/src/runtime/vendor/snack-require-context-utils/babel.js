"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snackRequireContextVirtualModuleBabelPlugin = void 0;
const context_1 = require("./context");
const path_1 = require("./path");
const defaultEnvVars = {
    EXPO_ROUTER_APP_ROOT: 'module://app',
    EXPO_ROUTER_IMPORT_MODE: 'sync',
    EXPO_PROJECT_ROOT: '/',
};
/**
 * Convert `require.context` statements to virtual modules `require(<vmodule>)`.
 * These virtual modules are resolved inside the Snack Runtime itself.
 * This Babel plugin is used in both Snackager (for libraries) and Snack Runtime (for user-provided code).
 */
function snackRequireContextVirtualModuleBabelPlugin({ types, }) {
    return {
        name: 'snack-require-context-virtual-module',
        visitor: {
            MemberExpression(path, state) {
                const node = path.node;
                // @ts-expect-error The plugin options aren't typed
                const envVars = { ...defaultEnvVars, ...(state.opts?.envVars ?? {}) };
                if (types.isCallExpression(path.parent) &&
                    types.isIdentifier(node.object, { name: 'require' }) &&
                    types.isIdentifier(node.property, { name: 'context' }) &&
                    !path.scope.hasOwnBinding('require') &&
                    path.parent.arguments.length >= 1) {
                    // Gather the `require.context` arguments
                    const directory = getStringValue(types, envVars, path.parent.arguments[0]);
                    // Determine if we can "likely" resolve the directory from a Snack project
                    if (!directory || !/^module:\/{1,2}|\.\//.test(directory)) {
                        return;
                    }
                    const isRecursive = getBooleanValue(types, envVars, path.parent.arguments[1]);
                    const matching = getRegexValue(types, envVars, path.parent.arguments[2]);
                    const mode = getStringValue(types, envVars, path.parent.arguments[3]);
                    // Resolve the context directory, either from user code or library code
                    const contextDirectory = 
                    // @ts-expect-error The plugin options aren't typed
                    state.opts.directoryResolution === 'relative' && state.filename
                        ? (0, context_1.resolveContextDirectory)((0, path_1.sanitizeFilePath)(state.filename), directory)
                        : directory;
                    // Convert the arguments into a virtual module path
                    const contextModule = (0, context_1.createVirtualModulePath)({
                        directory: contextDirectory,
                        isRecursive,
                        matching: matching ? new RegExp(matching) : undefined,
                        mode: !mode ? undefined : mode === 'async' ? 'async' : 'sync',
                    });
                    // If everything succeeded, replace the `require.context` with `require(<vmodule>)`
                    if (contextModule) {
                        path.parentPath.replaceWith(
                        // @ts-expect-error Somehow typescript doesnt like this
                        createRequireStatement(contextModule));
                    }
                }
            },
        },
    };
}
exports.snackRequireContextVirtualModuleBabelPlugin = snackRequireContextVirtualModuleBabelPlugin;
function getStringValue(types, envars, node) {
    if (types.isStringLiteral(node))
        return node.value;
    return getEnvironmentValue(types, envars, node);
}
function getBooleanValue(types, _envars, node) {
    if (types.isBooleanLiteral(node))
        return node.value;
    return undefined;
}
function getRegexValue(types, _envars, node) {
    if (types.isRegExpLiteral(node))
        return node.pattern;
    return undefined;
}
/**
 * Try to convert a `process.env.NAME` Babel node into a string.
 * This uses the environment variables, defined in the plugin options.
 */
function getEnvironmentValue(types, envars, node) {
    if (types.isMemberExpression(node) &&
        types.isMemberExpression(node.object) &&
        types.isIdentifier(node.object.object, { name: 'process' }) &&
        types.isIdentifier(node.object.property, { name: 'env' })) {
        for (const envName in envars) {
            if (types.isIdentifier(node.property, { name: envName })) {
                return envars[envName];
            }
        }
        return '';
    }
    return undefined;
}
/**
 * Generate the AST required for a `require("...")` statement.
 * We avoid importing the `@babel/core` `template` function to avoid adding it to the runtime.
 * A new AST can be created through `require('@babel/core').template.smart('require("...")')()`.
 */
function createRequireStatement(modulePath) {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'Identifier',
                name: 'require',
            },
            arguments: [
                {
                    type: 'StringLiteral',
                    value: modulePath,
                    extra: {
                        rawValue: modulePath,
                        raw: `"${modulePath}"`,
                    },
                },
            ],
        },
    };
}
//# sourceMappingURL=babel.js.map