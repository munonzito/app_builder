"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmptyContextModuleTemplate = exports.createContextModuleTemplate = exports.resolveContextDirectory = exports.resolveContextFiles = exports.convertVirtualModulePathToRequest = exports.createVirtualModulePath = exports.pathIsVirtualModule = void 0;
const path_1 = __importDefault(require("path"));
const base64_1 = require("./base64");
/** The basic pattern of a virtual module, containing `require.context` code */
const VIRTUAL_MODULE_PATTERN = /(.*)\?ctx=(.+)$/;
/**
 * Determine if a module path is a virtual module containing the `require.context` result.
 */
function pathIsVirtualModule(modulePath) {
    return VIRTUAL_MODULE_PATTERN.test(modulePath);
}
exports.pathIsVirtualModule = pathIsVirtualModule;
/**
 * Create the path of a virtual module that represents a `require.context` result.
 * This embeds the context options into a base64 encoded query string, to evaluate inside the Snack Runtime.
 */
function createVirtualModulePath(request) {
    const contextHash = JSON.stringify({
        r: request.isRecursive ?? true,
        m: request.matching?.source ?? '.*',
        o: request.mode ?? 'sync',
    });
    return `${request.directory}?ctx=${(0, base64_1.encodeBase64)(contextHash)}`;
}
exports.createVirtualModulePath = createVirtualModulePath;
/**
 * Reconstruct the context request from a virtual module path.
 * This decodes the base64 query string and loads the directory from the path.
 */
function convertVirtualModulePathToRequest(modulePath) {
    const [_, directory = '', contextHash] = modulePath.match(VIRTUAL_MODULE_PATTERN) ?? [];
    if (!contextHash) {
        throw new Error('Virtual module path does not contain the context hash');
    }
    const contextData = JSON.parse((0, base64_1.decodeBase64)(contextHash));
    const contextRequest = {
        directory,
        isRecursive: contextData.r ?? true,
        matching: new RegExp(contextData.m ?? '.*'),
        mode: contextData.o ?? 'sync',
    };
    return contextRequest;
}
exports.convertVirtualModulePathToRequest = convertVirtualModulePathToRequest;
/**
 * Resolve the requested context from existing Snack Runtime files.
 * This returns an object of modules that match the requested context.
 * Keys in this object are relative to the context directory, while values are relative to root.
 */
function resolveContextFiles(request, files) {
    let contextFiles = files.filter((snackPath) => snackPath.startsWith(request.directory));
    if (request.isRecursive === false) {
        const maxSegments = request.directory.split('/').length + 1;
        contextFiles = contextFiles.filter((snackPath) => snackPath.split('/').length <= maxSegments);
    }
    const relativePathReplace = new RegExp(`^${request.directory}/?`);
    return Object.fromEntries(contextFiles
        .map((snackPath) => [`./${snackPath.replace(relativePathReplace, '')}`, snackPath])
        .filter(([relativePath]) => request.matching.test(relativePath)));
}
exports.resolveContextFiles = resolveContextFiles;
/**
 * Resolve the requested `require.context` directory, relative from root.
 * This requires the full file path of the file in which it was requested.
 */
function resolveContextDirectory(filePath, requestedDir) {
    const fileDir = path_1.default.dirname(filePath);
    const contextDir = path_1.default.normalize(path_1.default.join(fileDir, requestedDir));
    return contextDir.replace(/\/$/, '');
}
exports.resolveContextDirectory = resolveContextDirectory;
/**
 * Create a virtual module that represents the code for `require.context()`.
 * All paths MUST be relative from root.
 */
function createContextModuleTemplate(moduleMap) {
    const moduleList = Object.keys(moduleMap);
    if (!moduleList.length) {
        return createEmptyContextModuleTemplate();
    }
    // Create the entries for each module, from root using `module://` as prefix
    // The `module://` is a SystemJS feature used in the Snack Runtime
    const moduleProperies = moduleList.map((module) => {
        return `'${module}': { enumerable: true, get() { return require('${moduleMap[module]}'); } }`;
    });
    return `
    const moduleMap = Object.defineProperties({}, {
      ${moduleProperies.join(',\n')}
    });

    function snackRequireContext(key) {
      return moduleMap[key];
    }

    snackRequireContext.keys = function snackRequireContextKeys() {
      return Object.keys(moduleMap);
    }

    snackRequireContext.resolve = function snackRequireContextResolve(key) {
      throw new Error('Unimplemented Snack require context functionality');
    }

    module.exports = snackRequireContext;
  `;
}
exports.createContextModuleTemplate = createContextModuleTemplate;
function createEmptyContextModuleTemplate() {
    return `
    function snackRequireContextEmpty() {
      const error = new Error('No modules found in require.context');
      error.code = 'MODULE_NOT_FOUND';
      throw error;
    }

    snackRequireContextEmpty.keys = function snackRequireContextEmptyKeys() {
      return [];
    }

    snackRequireContextEmpty.resolve = function snackRequireContextEmptyResolve(key) {
      throw new Error('Unimplemented Snack require context functionality');
    }

    module.exports = snackRequireContextEmpty;
  `;
}
exports.createEmptyContextModuleTemplate = createEmptyContextModuleTemplate;
//# sourceMappingURL=context.js.map