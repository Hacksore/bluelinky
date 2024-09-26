import { Brand } from '../interfaces/common.interfaces';
import { REGIONS } from '../constants';
export declare enum StampMode {
    LOCAL = "LOCAL",
    DISTANT = "DISTANT"
}
export declare const getStampFromFile: (stampFileKey: string, stampHost: string, stampsFile?: string) => () => Promise<string>;
export declare const getStampFromCFB: (appId: string, brand: Brand, region: REGIONS) => (() => Promise<string>);
export declare const getStampGenerator: ({ appId, brand, mode, region, stampHost, stampsFile, }: {
    appId: string;
    brand: Brand;
    mode: StampMode;
    region: REGIONS;
    stampHost: string;
    stampsFile?: string | undefined;
}) => (() => Promise<string>);
