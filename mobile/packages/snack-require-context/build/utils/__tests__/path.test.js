"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("../path");
describe(path_1.sanitizeFilePath, () => {
    it('removes leading `/`', () => {
        expect((0, path_1.sanitizeFilePath)('/components/Button.js')).toBe('components/Button.js');
    });
    it('removes leading `./`', () => {
        expect((0, path_1.sanitizeFilePath)('./components/Button.js')).toBe('components/Button.js');
    });
    it('removes leading `module://`', () => {
        expect((0, path_1.sanitizeFilePath)('module://components/Button.js')).toBe('components/Button.js');
    });
    // This could happen during Babel transpilation, not sure why though
    it('removes leading `module:/`', () => {
        expect((0, path_1.sanitizeFilePath)('module:/components/Button.js')).toBe('components/Button.js');
    });
});
//# sourceMappingURL=path.test.js.map