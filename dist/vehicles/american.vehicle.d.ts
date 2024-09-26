import { REGIONS } from '../constants';
import { VehicleStartOptions, VehicleStatus, VehicleLocation, VehicleRegisterOptions, VehicleOdometer, RawVehicleStatus, VehicleStatusOptions, FullVehicleStatus } from '../interfaces/common.interfaces';
import { Vehicle } from './vehicle';
import { AmericanController } from '../controllers/american.controller';
export default class AmericanVehicle extends Vehicle {
    vehicleConfig: VehicleRegisterOptions;
    controller: AmericanController;
    region: REGIONS;
    constructor(vehicleConfig: VehicleRegisterOptions, controller: AmericanController);
    private getDefaultHeaders;
    fullStatus(): Promise<FullVehicleStatus | null>;
    odometer(): Promise<VehicleOdometer | null>;
    /**
     * This is seems to always poll the modem directly, no caching
     */
    location(): Promise<VehicleLocation>;
    start(startConfig: VehicleStartOptions): Promise<string>;
    stop(): Promise<string>;
    status(input: VehicleStatusOptions): Promise<VehicleStatus | RawVehicleStatus | null>;
    unlock(): Promise<string>;
    lock(): Promise<string>;
    startCharge(): Promise<string>;
    stopCharge(): Promise<string>;
    private _request;
}
