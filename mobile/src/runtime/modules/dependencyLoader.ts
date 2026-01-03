import { Platform } from 'react-native';
import { SNACKAGER_API_URLS } from '../Constants';
import * as Logger from '../Logger';
import { getCacheFile, setCacheFile } from '../ModulesCache';
import { Dependencies } from './types';

const cacheBuster = '3';

export async function loadDependency(
  path: string,
  projectDependencies: Dependencies
): Promise<string> {
  const dependency = projectDependencies[path];
  const name = path[0] + path.slice(1).replace(/@[^@]+$/, '');
  const version = dependency.resolved ?? dependency.version;
  const handle = dependency.handle ?? `${name}@${version}`.replace(/\//g, '~');

  let bundle: string | undefined;
  const cacheHandle = handle.replace(/\//g, '~');
  const cacheFile = await getCacheFile(`snack-bundle-${cacheBuster}-${cacheHandle}-${Platform.OS}.js`);
  
  if (cacheFile) {
    bundle = cacheFile;
    Logger.module('Loaded dependency', cacheHandle, `from cache ${bundle ? bundle.length : undefined} bytes`);
  } else {
    for (const [i, url] of SNACKAGER_API_URLS.entries()) {
      const hasNextUrl = i < SNACKAGER_API_URLS.length - 1;
      const fetchFrom = `${url}/${handle}-${Platform.OS}/bundle.js`;

      try {
        Logger.module('Fetching dependency', fetchFrom, '...');
        const res = await fetch(fetchFrom);

        if (res.ok) {
          bundle = await res.text();
        } else {
          throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
        }
      } catch (e) {
        if (hasNextUrl) {
          Logger.error('Error fetching bundle', fetchFrom, e);
          throw e;
        } else {
          Logger.warn('Dependency could not be loaded from staging, trying production ...', handle);
        }
      }

      if (bundle) {
        Logger.module('Fetched dependency', fetchFrom, `storing in cache ${bundle.length} bytes`);
        break;
      }
    }

    if (!bundle) {
      throw new Error(`Unable to fetch module ${handle} for ${Platform.OS}.`);
    }

    try {
      await setCacheFile(`snack-bundle-${cacheBuster}-${cacheHandle}-${Platform.OS}.js`, bundle);
    } catch (error) {
      Logger.error('Failed to store dependency in cache', error);
    }
  }

  return `var __SNACK_PACKAGE_EXPORTS = {};
var __SNACK_PACKAGE_MODULE = { exports: __SNACK_PACKAGE_EXPORTS };
(function (module, exports) { ${bundle} })(
  __SNACK_PACKAGE_MODULE,
  __SNACK_PACKAGE_EXPORTS
);
module.exports = __SNACK_PACKAGE_EXPORTS[${JSON.stringify(path)}];`;
}
