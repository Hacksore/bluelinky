import { BlueLinkyConfig } from '../interfaces/common.interfaces';
import { CanadianBrandEnvironment } from '../constants/canada';
import { Vehicle } from '../vehicles/vehicle';
import { SessionController } from './controller';
export interface CanadianBlueLinkyConfig extends BlueLinkyConfig {
    region: 'CA';
}
export declare class CanadianController extends SessionController<CanadianBlueLinkyConfig> {
    private _environment;
    constructor(userConfig: CanadianBlueLinkyConfig);
    get environment(): CanadianBrandEnvironment;
    private vehicles;
    private timeOffset;
    refreshAccessToken(): Promise<string>;
    login(): Promise<string>;
    logout(): Promise<string>;
    getVehicles(): Promise<Array<Vehicle>>;
    private request;
}
