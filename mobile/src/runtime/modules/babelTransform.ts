import * as babel from 'snack-babel-standalone';
import * as context from 'snack-require-context';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
import * as Logger from '../Logger';
import * as Profiling from '../Profiling';
import WorkletsPlugin from '../vendor/worklets-plugin';
import { Load } from './types';
import { sanitizeModule } from './utils';

const sourceMapConsumers: { [key: string]: SourceMapConsumer } = {};
const transformCache: {
  [key: string]: { source: string; result: ReturnType<typeof babel.transform> | null };
} = {};

export async function translatePipeline(load: Load): Promise<string> {
  return await Profiling.section(`\`Modules.translatePipeline('${load.address}')\``, async () => {
    if (load.skipTranslate) {
      return load.source;
    }

    const filename = load.address.replace(/\.js$/, '');

    try {
      const transformed = Profiling.sectionSync(
        `\`Modules.translatePipeline('${load.address}')\` \`babel.transform()\``,
        () => {
          const cached = transformCache[filename];

          if (cached && cached.source === load.source) {
            return cached.result;
          }

          Logger.module('Transpiling', sanitizeModule(filename), '...');

          const result = babel.transform(load.source, {
            presets: ['@react-native/babel-preset'],
            plugins: [
              ['@babel/plugin-transform-async-to-generator'],
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-syntax-dynamic-import'],
              ['@babel/plugin-proposal-dynamic-import'],
              ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
              [
                context.snackRequireContextVirtualModuleBabelPlugin,
                { directoryResolution: 'relative' },
              ],
              ...(load.source.includes('react-native-reanimated') ||
              load.source.includes('react-native-worklets') ||
              load.source.includes('worklet')
                ? [WorkletsPlugin]
                : []),
            ],
            moduleIds: false,
            sourceMaps: true,
            compact: false,
            filename,
            sourceFileName: filename,
          });

          transformCache[filename] = { source: load.source, result };

          Logger.module(
            'Transpiled',
            sanitizeModule(filename),
            `${result?.code ? result.code.length : '???'} bytes`
          );

          return result;
        }
      );

      // @ts-ignore
      load.metadata.sourceMap = transformed.map;
      sourceMapConsumers[load.address] = await Profiling.section(
        `\`Modules.translatePipeline('${load.address}')\` \`new SourceMapConsumer()\``,
        async () =>
          await new SourceMapConsumer(
            // @ts-ignore
            transformed.map
          )
      );
      return transformed!.code;
    } catch (error: any) {
      return `throw new Error(${JSON.stringify(error.message)});`;
    }
  });
}

export function unmap({
  sourceURL,
  line,
  column,
}: {
  sourceURL: string;
  line: number;
  column: number;
}) {
  const consumer = sourceMapConsumers[sourceURL.replace(/!transpiled$/, '')];
  if (consumer) {
    const result = consumer.originalPositionFor({ line, column });
    if (result) {
      return {
        ...result,
        path: sourceURL
          .replace(/!transpiled$/, '')
          .replace(/^module:\/\//, '')
          .replace(/.([a-z]+).js$/, '.$1'),
      };
    }
  }
  return undefined;
}

export function clearTransformCache(paths: string[]): void {
  paths.forEach((path) => {
    const normalized = normalizeModuleUri(`module://${path}`);
    delete transformCache[normalized];
  });
}

function normalizeModuleUri(uri: string): string {
  let normalized = uri;
  while (normalized.endsWith('.js')) {
    normalized = normalized.slice(0, -3);
  }
  return normalized + '.js';
}

export { transformCache };
