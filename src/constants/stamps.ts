import { readFile } from 'fs';
import { promisify } from 'util';
import got from 'got';
import { Brand } from '../interfaces/common.interfaces';
import { hyundaiCFB as australiaHyundaiCFB, kiaCFB as australiaKiaCFB } from './australia.cfb';
import { hyundaiCFB as europeHyundaiCFB, kiaCFB as europeKiaCFB } from './europe.cfb';
import { REGIONS } from '../constants';

export enum StampMode {
  LOCAL = 'LOCAL',
  DISTANT = 'DISTANT',
}

interface StampCollection {
  stamps: string[];
  generated: string;
  frequency: number;
}

const cachedStamps = new Map<string, StampCollection>();

const getAndCacheStampsFromFile = async (
  file: string,
  stampHost: string,
  stampsFile = `${stampHost}${file}.v2.json`
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
  (stampFileKey: string, stampHost: string, stampsFile?: string) => async (): Promise<string> => {
    const { stamps, generated, frequency } =
      cachedStamps.get(stampFileKey) ??
      (await getAndCacheStampsFromFile(stampFileKey, stampHost, stampsFile));
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

const getCFB = (brand: Brand, region: REGIONS) => {
  switch (region) {
    case REGIONS.AU:
      return brand === 'kia' ? australiaKiaCFB : australiaHyundaiCFB;
    case REGIONS.EU:
      return brand === 'kia' ? europeKiaCFB : europeHyundaiCFB;
    default:
      throw new Error('Local stamp generation is only supported in Australia and Europe');
  }
};

export const getStampFromCFB = (
  appId: string,
  brand: Brand,
  region: REGIONS
): (() => Promise<string>) => {
  const cfb = getCFB(brand, region);
  return async (): Promise<string> => {
    const rawData = Buffer.from(`${appId}:${Date.now()}`, 'utf-8');
    return Promise.resolve(xorBuffers(cfb, rawData).toString('base64'));
  };
};

export const getStampGenerator = ({
  appId,
  brand,
  mode,
  region,
  stampHost,
  stampsFile,
}: {
  appId: string;
  brand: Brand;
  mode: StampMode;
  region: REGIONS;
  stampHost: string;
  stampsFile?: string;
}): (() => Promise<string>) => {
  switch (mode) {
    case StampMode.LOCAL:
      return getStampFromCFB(appId, brand, region);
    case StampMode.DISTANT:
    default:
      return getStampFromFile(`${brand}-${appId}`, stampHost, stampsFile);
  }
};
