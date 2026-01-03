/**
 * Maintains the state of the user's project files.
 * Ported from snack/runtime/src/Files.tsx
 */

type File = {
  isAsset: boolean;
  isBundled?: boolean;
  s3Url: string | undefined;
  contents: string | undefined;
};

const files: { [key: string]: File } = {};

/**
 * Update project files from API response.
 * This is the main entry point for loading code from our API.
 */
export function updateProjectFiles(
  newFiles: Record<string, { type: 'CODE' | 'ASSET'; contents: string }>
) {
  // Clear existing files
  for (const filePath in files) {
    delete files[filePath];
  }

  // Add new files
  for (const filePath in newFiles) {
    const newFile = newFiles[filePath];
    const isAsset = newFile.type === 'ASSET';
    files[filePath] = {
      isAsset,
      s3Url: isAsset ? newFile.contents : undefined,
      contents: !isAsset ? newFile.contents : undefined,
    };
  }
}

/**
 * Return the entrypoint path.
 */
export function entry(): string {
  // Prioritize App.tsx/App.js over index.js because:
  // 1. Our runtime handles component registration (no need for registerRootComponent)
  // 2. index.js typically just imports App and calls registerRootComponent which we don't support
  const names = [
    'App.tsx',
    'App.ts',
    'App.js',
    'app.js',
    'index.js',
    'index.ts',
    'index.tsx',
    'app/index.tsx', // Expo Router entry
    'app/index.ts',
    'app/index.js',
    'app/_layout.tsx', // Expo Router layout
    'app/_layout.ts',
    'app/_layout.js',
  ];

  for (const name of names) {
    if (files[name]) {
      return name;
    }
  }

  return 'App.js';
}

/**
 * Return information about a file.
 * Returns `undefined` if no such file.
 */
export function get(path: string): { isAsset: boolean; isBundled?: boolean; s3Url?: string; contents?: string } | undefined {
  // Try exact path first
  if (files[path]) {
    const { isAsset, isBundled, s3Url, contents } = files[path];
    if (isAsset) {
      return { isAsset, isBundled, s3Url };
    } else {
      return { isAsset, isBundled, contents };
    }
  }

  // Try with common extensions if path doesn't have one
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(path);
  if (!hasExtension) {
    const extensions = ['.js', '.ts', '.tsx', '.jsx', '.json'];
    for (const ext of extensions) {
      const pathWithExt = path + ext;
      if (files[pathWithExt]) {
        const { isAsset, isBundled, s3Url, contents } = files[pathWithExt];
        if (isAsset) {
          return { isAsset, isBundled, s3Url };
        } else {
          return { isAsset, isBundled, contents };
        }
      }
    }
  }

  return undefined;
}

/**
 * Return list of all file paths.
 */
export function list(): string[] {
  return Object.keys(files);
}

/**
 * Clear all files.
 */
export function clear(): void {
  for (const filePath in files) {
    delete files[filePath];
  }
}
