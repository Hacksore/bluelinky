import { EuropeanBrandEnvironment, EULanguages } from './../constants/europe';
import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import { GotInstance, GotJSONFn } from 'got';
import { Vehicle } from '../vehicles/vehicle';
import { SessionController } from './controller';
import { StampMode } from '../constants/stamps';
export interface EuropeBlueLinkyConfig extends BlueLinkyConfig {
    language?: EULanguages;
    region: 'EU';
    stampMode?: StampMode;
    stampsFile?: string;
}
export declare class EuropeanController extends SessionController<EuropeBlueLinkyConfig> {
    private _environment;
    private authStrategies;
    constructor(userConfig: EuropeBlueLinkyConfig);
    get environment(): EuropeanBrandEnvironment;
    session: Session;
    private vehicles;
    refreshAccessToken(): Promise<string>;
    enterPin(): Promise<string>;
    login(): Promise<string>;
    logout(): Promise<string>;
    getVehicles(): Promise<Array<Vehicle>>;
    private checkControlToken;
    getVehicleHttpService(): Promise<GotInstance<GotJSONFn>>;
    getApiHttpService(): Promise<GotInstance<GotJSONFn>>;
    private get defaultHeaders();
}
