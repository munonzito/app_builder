"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../context");
describe(context_1.pathIsVirtualModule, () => {
    it('returns true for virtual module', () => {
        expect((0, context_1.pathIsVirtualModule)('app?ctx=abc123')).toBe(true);
        expect((0, context_1.pathIsVirtualModule)('/app?ctx=abc123')).toBe(true);
        expect((0, context_1.pathIsVirtualModule)('./app?ctx=abc123')).toBe(true);
        expect((0, context_1.pathIsVirtualModule)('module:/app?ctx=abc123')).toBe(true);
        expect((0, context_1.pathIsVirtualModule)('module://app?ctx=abc123')).toBe(true);
    });
    it('returns false for non-virtual module', () => {
        expect((0, context_1.pathIsVirtualModule)('App.tsx')).toBe(false);
        expect((0, context_1.pathIsVirtualModule)('/App.tsx')).toBe(false);
        expect((0, context_1.pathIsVirtualModule)('./App.tsx')).toBe(false);
        expect((0, context_1.pathIsVirtualModule)('module://App.tsx')).toBe(false);
        expect((0, context_1.pathIsVirtualModule)('module:/app?ctx')).toBe(false);
    });
});
describe(context_1.createVirtualModulePath, () => {
    it('converts request to URL-safe virtual module path', () => {
        const request = requireContext('app', false, /\.tsx$/, 'sync');
        const virtualModule = (0, context_1.createVirtualModulePath)(request);
        expect(virtualModule).toBe(encodeURI(virtualModule));
    });
    it('converts empty paths', () => {
        const request = requireContext('', true, /\.mdx$/, 'async');
        const virtualModule = (0, context_1.createVirtualModulePath)(request);
        expect(virtualModule).toBe(encodeURI(virtualModule));
    });
    it('converts back and forth with identical request', () => {
        const request = requireContext('components', true, /.*/, 'async');
        const virtualModule = (0, context_1.createVirtualModulePath)(request);
        const convertedRequest = (0, context_1.convertVirtualModulePathToRequest)(virtualModule);
        expect(convertedRequest).toEqual(request);
        expect(convertedRequest).toHaveProperty('directory', 'components');
        expect(convertedRequest).toHaveProperty('isRecursive', true);
    });
});
describe(context_1.convertVirtualModulePathToRequest, () => {
    it('throws when ?ctx= is missing', () => {
        expect(() => (0, context_1.convertVirtualModulePathToRequest)('app')).toThrow(/not contain the context hash/);
    });
    it('throws when ?ctx= contains invalid JSON', () => {
        expect(() => (0, context_1.convertVirtualModulePathToRequest)('app?ctx=aGVsbG8')).toThrow();
    });
    it('converts empty directories', () => {
        const request = requireContext('', true, /\.tsx$/, 'sync');
        const virtualModule = (0, context_1.createVirtualModulePath)(request);
        const convertedRequest = (0, context_1.convertVirtualModulePathToRequest)(virtualModule);
        expect(convertedRequest).toEqual(request);
        expect(convertedRequest).toHaveProperty('directory', '');
    });
});
describe(context_1.resolveContextDirectory, () => {
    it('returns root relative paths', () => {
        expect((0, context_1.resolveContextDirectory)('./app/_layout.tsx', './')).toBe('app');
        expect((0, context_1.resolveContextDirectory)('./app/test/_layout.tsx', '../')).toBe('app');
        expect((0, context_1.resolveContextDirectory)('./app/home/_layout.tsx', './')).toBe('app/home');
        expect((0, context_1.resolveContextDirectory)('./components/Test.tsx', '../app/auth')).toBe('app/auth');
    });
});
describe(context_1.resolveContextFiles, () => {
    it('returns empty list without files', () => {
        expect((0, context_1.resolveContextFiles)(requireContext('app'), [])).toEqual({});
    });
    it('returns single matching file', () => {
        const files = ['components/test.tsx'];
        expect((0, context_1.resolveContextFiles)(requireContext('components'), files)).toMatchObject({
            './test.tsx': 'components/test.tsx',
        });
    });
    it('returns multiple matching files', () => {
        const files = ['ui/Avatar.js', 'components/User.tsx'];
        expect((0, context_1.resolveContextFiles)(requireContext('ui'), files)).toMatchObject({
            './Avatar.js': 'ui/Avatar.js',
        });
    });
    it('returns multiple matching files from nested path', () => {
        const files = ['App.tsx', 'components/ui/Button.js', 'components/ui/form/Input.tsx'];
        expect((0, context_1.resolveContextFiles)(requireContext('components/ui'), files)).toMatchObject({
            './Button.js': 'components/ui/Button.js',
            './form/Input.tsx': 'components/ui/form/Input.tsx',
        });
    });
    it('does not return nested files when not recursive', () => {
        const files = ['App.tsx', 'components/ui/Button.js', 'components/ui/form/Input.tsx'];
        expect((0, context_1.resolveContextFiles)(requireContext('components/ui', false), files)).toMatchObject({
            './Button.js': 'components/ui/Button.js',
        });
    });
    it('returns files matching regex pattern', () => {
        const files = ['App.tsx', 'components/ui/Button.js', 'components/ui/Textual.tsx'];
        expect((0, context_1.resolveContextFiles)(requireContext('', true, /\.tsx$/), files)).toMatchObject({
            './App.tsx': 'App.tsx',
            './components/ui/Textual.tsx': 'components/ui/Textual.tsx',
        });
    });
});
describe(context_1.createEmptyContextModuleTemplate, () => {
    /* eslint-disable no-eval */
    it('can be evaluated', () => {
        const files = { './non/existing/file.js': './non/existing/file.js' };
        expect(() => eval((0, context_1.createContextModuleTemplate)(files))).not.toThrow();
    });
    // Other functions will load the modules, don't want to do that in the test
});
describe(context_1.createEmptyContextModuleTemplate, () => {
    /* eslint-disable no-eval */
    it('can be evaluated', () => {
        expect(() => eval((0, context_1.createEmptyContextModuleTemplate)())).not.toThrow();
    });
    it('throws when loading modules', () => {
        expect(() => eval((0, context_1.createEmptyContextModuleTemplate)())('./test')).toThrow(/No modules found/);
    });
    it('returns empty array as keys', () => {
        expect(() => eval((0, context_1.createEmptyContextModuleTemplate)()).keys()).toHaveLength(0);
    });
    it('throws when using resolve', () => {
        expect(() => eval((0, context_1.createEmptyContextModuleTemplate)()).resolve('./test')).toThrow(/Unimplemented/);
    });
});
function requireContext(directory, isRecursive = true, matching = /^\.\/.*$/, mode = 'sync') {
    return { directory, isRecursive, matching, mode };
}
//# sourceMappingURL=context.test.js.map