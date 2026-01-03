import { RawSourceMap } from 'source-map';

export type Dependencies = {
  [key: string]: { resolved?: string; version: string; handle?: string };
};

export type Load = {
  source: string;
  address: string;
  skipTranslate?: boolean;
  metadata: {
    sourceMap?: RawSourceMap;
  };
};

export type FileInfo = {
  isAsset: boolean;
  isBundled?: boolean;
  s3Url?: string;
  contents?: string;
};
