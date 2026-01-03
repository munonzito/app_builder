"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const babel = __importStar(require("@babel/core"));
const babel_1 = require("../babel");
describe(babel_1.snackRequireContextVirtualModuleBabelPlugin, () => {
    it(`creates virtual module for require.context('./app')`, () => {
        expect(transpile(`require.context('./app')`)).toMatchInlineSnapshot(`"require("./app?ctx=eyJyIjp0cnVlLCJtIjoiLioiLCJvIjoic3luYyJ9");"`);
    });
    it(`creates virtual module for require.context('module://components')`, () => {
        expect(transpile(`require.context('module://components')`)).toMatchInlineSnapshot(`"require("module://components?ctx=eyJyIjp0cnVlLCJtIjoiLioiLCJvIjoic3luYyJ9");"`);
    });
    it('creates virtual module for require.context("./app", false)', () => {
        expect(transpile(`require.context('./app', false)`)).toMatchInlineSnapshot(`"require("./app?ctx=eyJyIjpmYWxzZSwibSI6Ii4qIiwibyI6InN5bmMifQ");"`);
    });
    it('creates virtual module for require.context("./app", false, /\\.mdx$/)', () => {
        expect(transpile(`require.context('./app', false, /\\.mdx$/)`)).toMatchInlineSnapshot(`"require("./app?ctx=eyJyIjpmYWxzZSwibSI6IlxcLm1keCQiLCJvIjoic3luYyJ9");"`);
    });
    it('creates virtual module for require.context("./app", false, /\\.mdx$/, "async")', () => {
        expect(transpile(`require.context('./app', false, /\\.mdx$/, 'async')`)).toMatchInlineSnapshot(`"require("./app?ctx=eyJyIjpmYWxzZSwibSI6IlxcLm1keCQiLCJvIjoiYXN5bmMifQ");"`);
    });
    it('creates virtual module for require.context(EXPO_ROUTER_APP_ROOT)', () => {
        expect(transpile(`require.context(process.env.EXPO_ROUTER_APP_ROOT)`)).toMatchInlineSnapshot(`"require("module://app?ctx=eyJyIjp0cnVlLCJtIjoiLioiLCJvIjoic3luYyJ9");"`);
    });
    it('creates virtual module for require.context(EXPO_ROUTER_APP_ROOT, true, /.*/, EXPO_ROUTER_IMPORT_MODE)', () => {
        const code = `
      require.context(
        process.env.EXPO_ROUTER_APP_ROOT,
        true,
        /.*/,
        process.env.EXPO_ROUTER_IMPORT_MODE
      )
    `;
        expect(transpile(code, { EXPO_ROUTER_IMPORT_MODE: 'async' })).toMatchInlineSnapshot(`"require("module://app?ctx=eyJyIjp0cnVlLCJtIjoiLioiLCJvIjoiYXN5bmMifQ");"`);
    });
    it('skips transpiling require.context() without arguments', () => {
        expect(transpile(`require.context()`)).toMatchInlineSnapshot(`"require.context();"`);
    });
    it('skips transpiling require.context(EXPO_ROUTER_APP_ROOT) when EXPO_ROUTER_APP_ROOT is empty', () => {
        const code = `require.context(process.env.EXPO_ROUTER_APP_ROOT)`;
        expect(transpile(code, { EXPO_ROUTER_APP_ROOT: '' })).toMatchInlineSnapshot(`"require.context(process.env.EXPO_ROUTER_APP_ROOT);"`);
    });
    it('skips transpiling require.context("/////////app")', () => {
        expect(transpile(`require.context('/////////app')`)).toMatchInlineSnapshot(`"require.context('/////////app');"`);
    });
});
function transpile(code, envVars) {
    const result = babel.transform(code, {
        plugins: [[babel_1.snackRequireContextVirtualModuleBabelPlugin, { envVars }]],
    });
    if (!result?.code) {
        throw new Error('Could not transpile code');
    }
    return result.code;
}
//# sourceMappingURL=babel.test.js.map