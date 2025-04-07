import { ChineseBrandEnvironment } from '../constants/china';
import { BlueLinkyConfig, Session } from '../interfaces/common.interfaces';
import { GotInstance, GotJSONFn } from 'got';
import { Vehicle } from '../vehicles/vehicle';
import { SessionController } from './controller';
export interface ChineseBlueLinkConfig extends BlueLinkyConfig {
    region: 'CN';
}
export declare class ChineseController extends SessionController<ChineseBlueLinkConfig> {
    private _environment;
    private authStrategies;
    constructor(userConfig: ChineseBlueLinkConfig);
    get environment(): ChineseBrandEnvironment;
    ß: any;
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
