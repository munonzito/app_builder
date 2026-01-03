export function transform(
  source: string,
  options: {
    presets?: string[];
    plugins?: any[];
    moduleIds?: boolean;
    sourceMaps?: boolean;
    compact?: boolean;
    filename?: string;
    sourceFileName?: string;
  }
): {
  code: string;
  map: any;
} | null;
