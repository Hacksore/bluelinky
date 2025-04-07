import { BlueLinkyConfig } from './../interfaces/common.interfaces';
import { Vehicle } from '../vehicles/vehicle';
import { SessionController } from './controller';
import { AmericaBrandEnvironment } from '../constants/america';
export interface AmericanBlueLinkyConfig extends BlueLinkyConfig {
    region: 'US';
}
export declare class AmericanController extends SessionController<AmericanBlueLinkyConfig> {
    private _environment;
    constructor(userConfig: AmericanBlueLinkyConfig);
    get environment(): AmericaBrandEnvironment;
    private vehicles;
    refreshAccessToken(): Promise<string>;
    login(): Promise<string>;
    logout(): Promise<string>;
    getVehicles(): Promise<Array<Vehicle>>;
}
