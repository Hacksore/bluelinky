import { VehicleStatus, FullVehicleStatus, VehicleLocation, VehicleOdometer, VehicleRegisterOptions } from '../interfaces/common.interfaces';
import { VehicleStartOptions, BlueLinkyConfig, RawVehicleStatus, VehicleStatusOptions } from '../interfaces/common.interfaces';
import { SessionController } from '../controllers/controller';
export declare abstract class Vehicle {
    vehicleConfig: VehicleRegisterOptions;
    controller: SessionController;
    abstract status(input: VehicleStatusOptions): Promise<VehicleStatus | RawVehicleStatus | null>;
    abstract fullStatus(input: VehicleStatusOptions): Promise<FullVehicleStatus | null>;
    abstract unlock(): Promise<string>;
    abstract lock(): Promise<string>;
    abstract start(config: VehicleStartOptions): Promise<string>;
    abstract stop(): Promise<string>;
    abstract location(): Promise<VehicleLocation | null>;
    abstract odometer(): Promise<VehicleOdometer | null>;
    _fullStatus: FullVehicleStatus | null;
    _status: VehicleStatus | RawVehicleStatus | null;
    _location: VehicleLocation | null;
    _odometer: VehicleOdometer | null;
    userConfig: BlueLinkyConfig;
    constructor(vehicleConfig: VehicleRegisterOptions, controller: SessionController);
    vin(): string;
    name(): string;
    nickname(): string;
    id(): string;
    brandIndicator(): string;
}
