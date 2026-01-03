"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base64_1 = require("../base64");
describe(base64_1.encodeBase64, () => {
    it('returns base64 from stringified object', () => {
        expect((0, base64_1.encodeBase64)(JSON.stringify({ foo: 'bar' }))).toBe('eyJmb28iOiJiYXIifQ');
    });
    it('returns empty base64 from empty string', () => {
        expect((0, base64_1.encodeBase64)('')).toBe('');
    });
    it('returns base64 without url unsafe `=` character', () => {
        // "hello world" is actually "aGVsbG8gd29ybGQ=", but `=` is not URL safe
        expect((0, base64_1.encodeBase64)('hello world')).toBe('aGVsbG8gd29ybGQ');
    });
    it('returns base64 without url unsafe `/` character', () => {
        // "hello?world" is actually "aGVsbG8/d29ybGQ=", but `/` is URL unsafe
        expect((0, base64_1.encodeBase64)('hello?world')).toBe('aGVsbG8_d29ybGQ');
    });
    it('returns base64 without url unsafe `+` character', () => {
        // "hello>world" is actually "aGVsbG8+d29ybGQ=", but `+` is URL unsafe
        expect((0, base64_1.encodeBase64)('hello>world')).toBe('aGVsbG8-d29ybGQ');
    });
});
describe(base64_1.decodeBase64, () => {
    it('returns stringified object from base64', () => {
        expect((0, base64_1.decodeBase64)('eyJmb28iOiJiYXIifQ')).toBe(JSON.stringify({ foo: 'bar' }));
    });
    it('returns empty string from empty base64', () => {
        expect((0, base64_1.decodeBase64)('')).toBe('');
    });
    it('returns string from base64 without trailing `=` characters', () => {
        // "hello world" is actually "aGVsbG8gd29ybGQ=", but `=` is not URL safe
        expect((0, base64_1.decodeBase64)('aGVsbG8gd29ybGQ')).toBe('hello world');
    });
    it('returns string from base64 with replaced `/` > `_` character', () => {
        // "hello?world" is actually "aGVsbG8/d29ybGQ=", but `/` is URL unsafe
        expect((0, base64_1.decodeBase64)('aGVsbG8_d29ybGQ')).toBe('hello?world');
    });
    it('returns string from base64 with replaced `+` > `-` character', () => {
        // "hello>world" is actually "aGVsbG8+d29ybGQ=", but `+` is URL unsafe
        expect((0, base64_1.decodeBase64)('aGVsbG8-d29ybGQ')).toBe('hello>world');
    });
});
//# sourceMappingURL=base64.test.js.map