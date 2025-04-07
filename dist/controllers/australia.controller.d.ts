import { GotInstance, GotJSONFn } from 'got';
import { Vehicle } from '../vehicles/vehicle';
import { AustraliaBrandEnvironment } from './../constants/australia';
import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import { SessionController } from './controller';
import { StampMode } from '../constants/stamps';
export interface AustraliaBlueLinkyConfig extends BlueLinkyConfig {
    region: 'AU';
    stampMode?: StampMode;
    stampsFile?: string;
}
export declare class AustraliaController extends SessionController<AustraliaBlueLinkyConfig> {
    private _environment;
    private authStrategy;
    constructor(userConfig: AustraliaBlueLinkyConfig);
    get environment(): AustraliaBrandEnvironment;
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
