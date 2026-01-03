import * as context from 'snack-require-context';
import * as Files from '../Files';
import * as Logger from '../Logger';
import { Load } from './types';

const virtualModules: Map<string, Set<string>> = new Map();
const allVirtualModules: Set<string> = new Set();

export function handleVirtualModule(load: Load, uri: string): string {
  const contextUri = context.sanitizeFilePath(uri.replace(/(\.js)+$/, ''));
  const contextRequest = context.convertVirtualModulePathToRequest(contextUri);
  const contextFiles = context.resolveContextFiles(contextRequest, Files.list());

  load.skipTranslate = true;
  virtualModules.set(uri, new Set(Object.values(contextFiles)));
  allVirtualModules.add(uri);

  for (const fileName in contextFiles) {
    contextFiles[fileName] = `module://${contextFiles[fileName]}`;

    if (virtualModules.has(contextFiles[fileName])) {
      virtualModules.get(contextFiles[fileName])!.add(uri);
    } else {
      virtualModules.set(contextFiles[fileName], new Set([uri]));
    }
  }

  return context.createContextModuleTemplate(contextFiles);
}

export function getVirtualModulePaths(paths: string[], transformCache: Record<string, any>): Set<string> {
  const virtualModulePaths: Set<string> = new Set();
  
  for (const path of paths) {
    const cacheKey = path.startsWith('module://') ? path : `module://${path}.js`;
    if (!transformCache[cacheKey]) {
      Logger.module('New file detected, clearing all virtual modules.', path);
      allVirtualModules.forEach((p) => virtualModulePaths.add(p));
      break;
    }
    virtualModules.get(path)?.forEach((p) => virtualModulePaths.add(p));
  }
  
  return virtualModulePaths;
}

export { virtualModules, allVirtualModules };
