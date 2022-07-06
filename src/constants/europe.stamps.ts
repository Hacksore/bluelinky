import { readFile } from 'fs';
import { promisify } from 'util';
import got from 'got';
import { Brand } from '../interfaces/common.interfaces';
import { hyundaiCFB, kiaCFB } from './europe.cfb';
import { StampMode } from '../controllers/european.controller';

interface StampCollection {
  stamps: string[];
  generated: string;
  frequency: number;
}

const cachedStamps = new Map<string, StampCollection>();

const getAndCacheStampsFromFile = async (
  file: string,
  stampsFile = `https://raw.githubusercontent.com/neoPix/bluelinky-stamps/master/${file}.v2.json`
): Promise<StampCollection> => {
  if (stampsFile.startsWith('file://')) {
    const [, path] = stampsFile.split('file://');
    const content = await promisify(readFile)(path);
    return JSON.parse(content.toString('utf-8'));
  }
  const { body } = await got(stampsFile, { json: true });
  cachedStamps.set(file, body as StampCollection);
  return body as StampCollection;
};

export const getStampFromFile =
  (stampFileKey: string, stampsFile?: string) => async (): Promise<string> => {
    const { stamps, generated, frequency } =
      cachedStamps.get(stampFileKey) ?? (await getAndCacheStampsFromFile(stampFileKey, stampsFile));
    const generatedDate = new Date(generated);
    const millisecondsSinceStampsGeneration = Date.now() - generatedDate.getTime();
    const position = Math.floor(millisecondsSinceStampsGeneration / frequency);
    if (position / (stamps.length - 1) >= 0.9) {
      cachedStamps.delete(stampFileKey);
    }
    return stamps[Math.min(position, stamps.length - 1)];
  };

const xorBuffers = (a: Buffer, b: Buffer) => {
  if (a.length !== b.length) {
    throw new Error(`XOR Buffers are not the same size ${a.length} vs ${b.length}`);
  }
  const outBuffer = Buffer.alloc(a.length);
  for (let i = 0; i < outBuffer.length; i++) {
    outBuffer.writeUInt8(a[i] ^ b[i], i);
  }
  return outBuffer;
};

const getCFB = (brand: Brand) => {
  switch (brand) {
    case 'kia':
      return kiaCFB;
    case 'hyundai':
      return hyundaiCFB;
  }
};

export const getStampFromCFB = (appId: string, brand: Brand): (() => Promise<string>) => {
  const cfb = getCFB(brand);
  return async (): Promise<string> => {
    const rawData = Buffer.from(`${appId}:${Date.now()}`, 'utf-8');
    return Promise.resolve(xorBuffers(cfb, rawData).toString('base64'));
  };
};

export const getStampGenerator = ({
  mode,
  appId,
  brand,
  stampsFile,
}: {
  brand: Brand;
  mode: StampMode;
  appId: string;
  stampsFile?: string;
}): (() => Promise<string>) => {
  switch (mode) {
    case StampMode.LOCAL:
      return getStampFromCFB(appId, brand);
    case StampMode.DISTANT:
    default:
      return getStampFromFile(`${brand}-${appId}`, stampsFile);
  }
};
