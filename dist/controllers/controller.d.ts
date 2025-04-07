import { Vehicle } from '../vehicles/vehicle';
import { Session } from '../interfaces/common.interfaces';
import { BlueLinkyConfig } from '../interfaces/common.interfaces';
export declare abstract class SessionController<T extends BlueLinkyConfig = BlueLinkyConfig> {
    readonly userConfig: T;
    abstract login(): Promise<string>;
    abstract logout(): Promise<string>;
    abstract getVehicles(): Promise<Array<Vehicle>>;
    abstract refreshAccessToken(): Promise<string>;
    session: Session;
    constructor(userConfig: T);
}
