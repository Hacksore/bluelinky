import { Brand } from '../interfaces/common.interfaces';
import { StampMode } from '../controllers/european.controller';
export declare const getStampFromFile: (stampFileKey: string, stampsFile?: string | undefined) => () => Promise<string>;
export declare const getStampFromCFB: (appId: string, brand: Brand) => (() => Promise<string>);
export declare const getStampGenerator: ({ mode, appId, brand, stampsFile, }: {
    brand: Brand;
    mode: StampMode;
    appId: string;
    stampsFile?: string | undefined;
}) => (() => Promise<string>);
