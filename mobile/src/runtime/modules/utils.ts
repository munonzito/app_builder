export function sanitizeModule(moduleName: string): string {
  return moduleName.substring(
    moduleName.startsWith('module://') ? 9 : 0,
    moduleName.endsWith('.js.js') ? moduleName.length - 3 : moduleName.length
  );
}

export function normalizeModuleUri(uri: string): string {
  let normalized = uri;
  while (normalized.endsWith('.js')) {
    normalized = normalized.slice(0, -3);
  }
  return normalized + '.js';
}

export const startsWith = (base: string, search: string) => 
  String(base).indexOf(String(search)) === 0;
