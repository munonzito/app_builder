// Maintain JavaScript modules forming the runtime state of the user's Snack application.
// This is implemented using SystemJS, with URIs of the form `module://...` internally.

import escapeStringRegexp from 'escape-string-regexp';
import { Asset } from 'expo-asset';
import path from 'path';
import React from 'react';
import { Platform, PixelRatio } from 'react-native';
import * as GestureHandler from 'react-native-gesture-handler';
import * as context from 'snack-require-context';

import * as Files from './Files';
import * as Logger from './Logger';
import * as Profiling from './Profiling';
import aliases from './aliases';
import System from './vendor/system.src';

import {
  Dependencies,
  Load,
  sanitizeModule,
  normalizeModuleUri,
  startsWith,
  loadAsset,
  loadDependency,
  translatePipeline,
  unmap as unmapSourceMap,
  transformCache,
  handleVirtualModule,
  getVirtualModulePaths,
} from './modules';

// Fix React module loading
// @ts-ignore
React.__esModule = true;
// @ts-ignore
React.default = React;

// Load expo-asset for side effects
Asset;

// Load gesture handler early
GestureHandler;

// Set __DEV__ variable
// @ts-expect-error
if (typeof global['__DEV__'] !== 'boolean') {
  // @ts-expect-error
  global['__DEV__'] = false;
}

let projectDependencies: Dependencies = {};

export const updateProjectDependencies = async (newProjectDependencies: Dependencies) => {
  const removedOrChangedDependencies = Object.keys(projectDependencies).filter(
    (name) =>
      !newProjectDependencies[name] ||
      newProjectDependencies[name].resolved !== projectDependencies[name].resolved
  );
  const addedDependencies = Object.keys(newProjectDependencies).filter(
    (name) => !projectDependencies[name]
  );
  const changedDependencies = removedOrChangedDependencies.concat(addedDependencies);
  
  if (changedDependencies.length) {
    Logger.module(
      'Changed dependencies',
      changedDependencies.map(
        (name) =>
          `${name} (${
            newProjectDependencies[name]
              ? projectDependencies[name]
                ? `${projectDependencies[name].resolved} -> ${newProjectDependencies[name].resolved}`
                : newProjectDependencies[name].resolved
              : 'removed'
          })`
      )
    );
  }
  
  const removedOrChangedUris = removedOrChangedDependencies.map((name) => `module://${name}`);
  await flush({ changedUris: removedOrChangedUris });
  projectDependencies = newProjectDependencies;
  return changedDependencies.map(sanitizeModule);
};

const fetchPipeline = async (load: Load) => {
  return await Profiling.section(`\`Modules.fetchPipeline('${load.address}')\``, async () => {
    const uri = load.address;

    if (!startsWith(uri, 'module://')) {
      throw new Error(`Invalid module URI '${uri}', must start with 'module://'`);
    }

    if (context.pathIsVirtualModule(uri)) {
      return handleVirtualModule(load, uri);
    }

    try {
      const path = uri.replace(/^module:\/\//, '').replace(/\.js$/, '');
      const file = Files.get(path);

      if (file) {
        const { isAsset, isBundled, s3Url, contents } = file;
        const isJson = /\.json$/i.test(path);

        if (isAsset && s3Url) {
          return await loadAsset(path, s3Url);
        } else if (isJson) {
          return `module.exports = ${contents}`;
        } else {
          load.skipTranslate = isBundled;
          return contents;
        }
      }

      if (projectDependencies[path]) {
        return await loadDependency(path, projectDependencies);
      }

      throw new Error(`Unable to resolve module '${uri}'`);
    } catch (error: any) {
      return `throw new Error(${JSON.stringify(error.message)});`;
    }
  });
};

// SystemJS eval pipeline
// @ts-ignore
global.evaluate = (src: string, options: { filename?: string } = {}) => {
  return Profiling.section(`\`Modules.evalPipeline('${options.filename}')\``, () => {
    // @ts-ignore
    if (global.globalEvalWithSourceUrl) {
      // @ts-ignore
      global.__SNACK_EVAL_EXCEPTION = null;
      src = `(function () { try { ${src}\n } catch (e) { this.__SNACK_EVAL_EXCEPTION = e; } })();`;

      // @ts-ignore
      const r = global.globalEvalWithSourceUrl(src, options.filename);

      // @ts-ignore
      if (global.__SNACK_EVAL_EXCEPTION) {
        // @ts-ignore
        const e = global.__SNACK_EVAL_EXCEPTION;
        // @ts-ignore
        global.__SNACK_EVAL_EXCEPTION = null;
        throw e;
      }
      return r;
    }
    // eslint-disable-next-line no-eval
    return (0, eval)(src);
  });
};

const _initialize = async () => {
  await System.set(
    'systemjs-expo-snack-plugin',
    System.newModule({ translate: translatePipeline, fetch: fetchPipeline })
  );
  
  await System.config({
    packages: {
      '.': {
        defaultExtension: 'js',
      },
    },
    meta: {
      '*.js': {
        format: 'cjs',
        loader: 'systemjs-expo-snack-plugin',
      },
    },
  });

  System.trace = true;

  await Promise.all(
    Object.keys(aliases).map(
      async (key) =>
        await System.set(key, System.newModule({ default: aliases[key], __useDefault: true }))
    )
  );

  const vectorIcons = require('@expo/vector-icons');
  const vectorIconsModule = System.newModule(vectorIcons);

  await System.set('@expo/vector-icons', vectorIconsModule);
  await System.set('react-native-vector-icons', vectorIconsModule);

  await Promise.all(
    Object.keys(vectorIcons).map(async (name) => {
      const iconSet = vectorIcons[name];
      iconSet.default = iconSet.default ?? iconSet;
      const iconSetModule = System.newModule({ default: iconSet, __useDefault: true });

      await System.set(`@expo/vector-icons/${name}`, iconSetModule);
      await System.set(`react-native-vector-icons/${name}`, iconSetModule);
    })
  );

  const oldResolve = System.resolve;

  System.resolve = async function (url: string, baseUrl?: string) {
    if (baseUrl && startsWith(url, '.')) {
      const basePath = baseUrl.replace(/^module:\/\//, '');
      url = 'module://' + path.normalize(`${path.dirname(basePath)}/${url}`);
    }

    if (context.pathIsVirtualModule(url)) {
      return await oldResolve.call(this, url.replace(/^module:\/\/?/, 'module://'), baseUrl);
    }

    if (/^module:\/\//.test(url)) {
      const extensions = ['.tsx', '.ts', '.js'];
      const platforms =
        Platform.OS === 'web'
          ? [Platform.OS, `${Platform.OS}.expo`]
          : ['native', Platform.OS, 'native.expo', `${Platform.OS}.expo`];

      let resolved;
      const basename = url.replace(/^module:\/\//, '');

      for (const suffix of [...extensions, '']) {
        const filename = basename + suffix;
        const ext = filename.split('.').pop() as string;
        const isImage = /^(bmp|gif|jpg|jpeg|png|psd|tiff|webp|svg)$/i.test(ext);

        const regex = new RegExp(
          `^${escapeStringRegexp(filename.replace(/\.[^.]+$/i, ''))}(${
            isImage ? '@\\d+(\\.\\d+)?x' : '()'
          })?(\\.([a-z]+(\.expo)?))?\\.${ext}$`
        );

        const map = Files.list().reduce(
          (acc, curr) => {
            const match = curr.match(regex);

            if (match) {
              const [, scaleString, , , platform] = match;
              const scale = scaleString ? parseFloat(scaleString.substr(1)) : 1;

              if (platform && !platforms.includes(platform)) {
                return acc;
              }

              if (
                acc[scale] &&
                platforms.indexOf(acc[scale].platform) > platforms.indexOf(platform)
              ) {
                return acc;
              }

              return { ...acc, [scale]: { path: curr, platform } };
            }

            return acc;
          },
          {} as { [key: string]: { path: string; platform: string } }
        );

        if (Object.keys(map).length) {
          const scale = PixelRatio.get();
          const closest = Object.keys(map)
            .map((x) => Number(x))
            .sort((a, b) => a - b)
            .reduce((result, curr) => (result >= scale ? result : curr));

          if (map[closest] && Files.get(map[closest].path)) {
            resolved = map[closest].path;
            break;
          }
        }

        if (!resolved && Files.get(filename)) {
          resolved = filename;
          break;
        }
      }

      if (!resolved) {
        let index = 'index';
        let ext = '';

        if (Files.get(basename + '/package.json')) {
          try {
            const pack = JSON.parse(
              (Files.get(basename + '/package.json') ?? { contents: '' }).contents || '{}'
            );
            index = pack['react-native'] || pack['main'] || 'index';
            ext = index.split('.').pop()!;
            index = index.replace(/^\.\//, '');
          } catch {
            // Ignore error
          }
        }

        if (ext) {
          for (const platform of platforms) {
            const f = basename + '/' + index.replace(/\.[^.]$/, '') + '.' + platform + '.' + ext;
            if (Files.get(f)) {
              resolved = f;
              break;
            }
          }
        }

        if (!resolved) {
          const f = basename + '/' + index;
          if (Files.get(f)) {
            resolved = f;
          }

          for (const suffix of extensions) {
            const f = basename + '/' + index + suffix;
            if (Files.get(f)) {
              resolved = f;
              break;
            }
          }
        }

        if (!resolved) {
          for (const suffix of extensions) {
            for (const platform of platforms) {
              const f = basename + '/' + index + '.' + platform + suffix;
              if (Files.get(f)) {
                resolved = f;
                break;
              }
            }
          }
        }
      }

      if (resolved) {
        url = 'module://' + resolved;
      }

      if (!url.endsWith('.js')) {
        url += '.js';
      }
    }

    return await oldResolve.call(this, url, baseUrl);
  };

  System.dependents = async function (rootModuleNames: string[]): Promise<string[]> {
    if (!this.loads) {
      return [];
    }

    const dependsOn: { [key: string]: { [key: string]: boolean } } = {};

    await Promise.all(
      Object.keys(this.loads).map((url) => {
        dependsOn[url] = {};
        return this.loads[url].deps.map(
          async (dep: string) => (dependsOn[url][await this.resolve(dep, url)] = true)
        );
      })
    );

    const visited: { [key: string]: boolean } = {};
    const order: string[] = [];

    const visit = (url: string) => {
      if (!visited[url]) {
        visited[url] = true;
        Object.keys(this.loads).forEach((other) => {
          if (dependsOn[other][url]) {
            visit(other);
          }
        });
        order.push(url);
      }
    };

    if (!Array.isArray(rootModuleNames)) {
      rootModuleNames = [rootModuleNames];
    }
    const resolvedRootUrls = await Promise.all(rootModuleNames.map((name) => this.resolve(name)));
    resolvedRootUrls.forEach(visit);

    return order;
  };

  System.keys = function () {
    return this.registry.keys();
  };
};

let awaitLastFlush = Promise.resolve();

export const flush = async ({
  changedPaths = [],
  changedUris = [],
}: {
  changedPaths?: string[];
  changedUris?: string[];
}) => {
  awaitLastFlush = awaitLastFlush.then(async () => {
    const paths = [
      ...changedUris.map((uri) => (uri.startsWith('module://') ? normalizeModuleUri(uri) : uri)),
      ...changedPaths.map((p) => normalizeModuleUri(`module://${p}`)),
    ];

    const virtualModulePaths = getVirtualModulePaths(paths, transformCache);

    const dependents = await System.dependents(paths);
    let modules = [...dependents, ...virtualModulePaths, ...paths];
    modules = modules.filter((name, index) => System.has(name) && modules.indexOf(name) >= index);
    
    if (modules.length) {
      Logger.module('Unloading modules', modules.map(sanitizeModule));
    }
    modules.forEach((dep: string) => System.delete(dep));

    changedPaths.forEach((p) => delete transformCache[normalizeModuleUri(`module://${p}`)]);
  });

  return awaitLastFlush;
};

let waitForInitialize: Promise<void>;

export const initialize = async () => {
  waitForInitialize = waitForInitialize || _initialize();
  return waitForInitialize;
};

export const has = async (uri: string) => {
  await awaitLastFlush;
  return System.has(uri);
};

export const load = async (name: string, relativeTo?: string) => {
  Logger.module('Loading root', sanitizeModule(name), '...');
  const res = await System.import(name, relativeTo);
  Logger.module(
    'Loaded modules',
    Array.from<string>(System.keys())
      .filter((name) => name.toLowerCase().indexOf('app.js') >= 0 || name.indexOf('module://') >= 0)
      .map(sanitizeModule)
  );
  return res;
};

export { unmap } from './modules';
export { sanitizeModule };
