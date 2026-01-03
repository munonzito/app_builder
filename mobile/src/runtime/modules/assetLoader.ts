import { Platform } from 'react-native';
import * as Logger from '../Logger';
import { getCacheFile, setCacheFile } from '../ModulesCache';
import * as AssetRegistry from '../NativeModules/AssetRegistry';

const cacheBuster = '3';

const getHeader = (header: { [key: string]: string } | null, value: string) =>
  header?.hasOwnProperty(value) ? header[value] : null;

export async function loadAsset(
  path: string,
  s3Url: string
): Promise<string> {
  const isImage = /\.(bmp|png|jpg|jpeg|gif|svg|webp|tiff|webp)$/i.test(path.toLowerCase());

  if (!isImage && Platform.OS === 'web') {
    return `module.exports = ${JSON.stringify(s3Url)};`;
  }

  const hash = s3Url.replace(/.*(~|%7E)asset\//, '');
  let metaData: { [key: string]: string | null } | null = null;
  let type, width, height;

  try {
    const cacheFile = await getCacheFile(`snack-asset-metadata-${cacheBuster}-${hash}.json`);
    if (cacheFile) {
      metaData = JSON.parse(cacheFile);
      Logger.module('Loaded asset metadata', s3Url, `from cache ${cacheFile ? cacheFile.length : undefined} bytes`);
    } else {
      Logger.module('Fetching asset metadata', s3Url, '...');
      const response = await fetch(s3Url, {
        method: 'HEAD',
        mode: Platform.OS === 'web' ? 'cors' : 'no-cors',
      });

      if (response.headers?.hasOwnProperty('map')) {
        // @ts-expect-error: expression of type '"map"' can't be used to index type 'Headers'
        const mapHeaders = response.headers['map'];
        if (mapHeaders) {
          metaData = {
            type: getHeader(mapHeaders, 'x-amz-meta-type'),
            width: getHeader(mapHeaders, 'x-amz-meta-width'),
            height: getHeader(mapHeaders, 'x-amz-meta-height'),
          };
        }
      } else if (response.headers.get('x-amz-meta-type')) {
        metaData = {
          type: response.headers.get('x-amz-meta-type'),
          width: response.headers.get('x-amz-meta-width'),
          height: response.headers.get('x-amz-meta-height'),
        };
      }
      if (metaData) {
        try {
          await setCacheFile(`snack-asset-metadata-${cacheBuster}-${hash}.json`, JSON.stringify(metaData));
        } catch (error) {
          Logger.error('Failed to store asset metadata in cache', error);
        }
      }
    }
  } catch (error: any) {
    Logger.error(`Error fetching metadata: ${error.message}`);
  }

  if (metaData) {
    type = metaData.type || path.split('.').pop();
    width = parseFloat(metaData.width ?? '');
    height = parseFloat(metaData.height ?? '');

    const match = path.match(/^.+@(\d+(\.\d+)?)x(\.[a-z]+)?\.[^.]+$/);
    if (match) {
      const scale = parseFloat(match[1]);
      width /= scale;
      height /= scale;
    }
  }

  const assetId = AssetRegistry.registerAsset({
    hash,
    name: hash,
    scales: [1],
    fileHashes: [hash],
    httpServerLocation: 'https://snack-code-uploads.s3-us-west-1.amazonaws.com/~asset',
    uri: s3Url,
    ...(metaData
      ? {
          width,
          height,
          type: Platform.OS === 'web' ? undefined : type,
        }
      : null),
  });
  
  Logger.module('Registered asset', s3Url, 'as number', assetId);
  return `module.exports = ${assetId};`;
}
