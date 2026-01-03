interface SystemJSLoader {
  set(key: string, module: any): Promise<void>;
  config(config: any): Promise<void>;
  newModule(obj: any): any;
  import(name: string, relativeTo?: string): Promise<any>;
  has(uri: string): boolean;
  delete(uri: string): void;
  trace: boolean;
  loads: { [key: string]: { deps: string[] } };
  registry: { keys(): IterableIterator<string> };
  resolve: (url: string, baseUrl?: string) => Promise<string>;
  dependents: (rootModuleNames: string[]) => Promise<string[]>;
  keys: () => IterableIterator<string>;
}

declare const System: SystemJSLoader;
export default System;
