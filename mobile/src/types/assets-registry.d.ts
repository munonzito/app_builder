declare module '@react-native/assets-registry/registry' {
  export type AssetDestPathResolver = '#{dest}' | ((asset: PackagerAsset) => string);
  
  export interface PackagerAsset {
    __packager_asset: boolean;
    fileSystemLocation: string;
    httpServerLocation: string;
    width?: number;
    height?: number;
    scales: number[];
    hash: string;
    name: string;
    type: string;
  }

  export function registerAsset(asset: any): number;
  export function getAssetByID(assetId: number): PackagerAsset | undefined;
}
