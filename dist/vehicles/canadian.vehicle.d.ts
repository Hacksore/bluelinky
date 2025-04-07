import { REGIONS, ChargeTarget } from '../constants';
import { VehicleStartOptions, VehicleLocation, VehicleRegisterOptions, VehicleStatus, VehicleOdometer, VehicleStatusOptions, RawVehicleStatus, FullVehicleStatus, VehicleInfo, VehicleFeatureEntry } from '../interfaces/common.interfaces';
import { Vehicle } from './vehicle';
import { CanadianController } from '../controllers/canadian.controller';
export interface CanadianInfo {
    vehicle: VehicleInfo;
    features: {
        seatHeatVent: {
            drvSeatHeatOption: number;
            astSeatHeatOption: number;
            rlSeatHeatOption: number;
            rrSeatHeatOption: number;
        };
        hvacTempType: number;
        targetMinSoc: number;
        strgWhlHeatingOption: number;
    };
    featuresModel: {
        features: [VehicleFeatureEntry];
    };
    status: RawVehicleStatus;
}
export default class CanadianVehicle extends Vehicle {
    vehicleConfig: VehicleRegisterOptions;
    controller: CanadianController;
    region: REGIONS;
    private timeOffset;
    private _info;
    constructor(vehicleConfig: VehicleRegisterOptions, controller: CanadianController);
    fullStatus(): Promise<FullVehicleStatus | null>;
    status(input: VehicleStatusOptions): Promise<VehicleStatus | RawVehicleStatus | null>;
    lock(): Promise<string>;
    unlock(): Promise<string>;
    start(startConfig: VehicleStartOptions): Promise<string>;
    stop(): Promise<string>;
    lights(withHorn?: boolean): Promise<string>;
    /**
     * Warning only works on EV vehicles
     * @returns
     */
    stopCharge(): Promise<void>;
    /**
     * Warning only works on EV vehicles
     * @returns
     */
    startCharge(): Promise<void>;
    /**
     *  Warning only works on EV vehicles
     * @param limits
     * @returns Promise<void>
     */
    setChargeTargets(limits: {
        fast: ChargeTarget;
        slow: ChargeTarget;
    }): Promise<void>;
    odometer(): Promise<VehicleOdometer | null>;
    location(): Promise<VehicleLocation>;
    private getPreAuth;
    private request;
    private setInfo;
}
