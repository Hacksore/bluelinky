import { ChargeTarget, REGIONS } from '../constants';
import { DeepPartial, FullVehicleStatus, RawVehicleStatus, VehicleDayTrip, VehicleLocation, VehicleMonthTrip, VehicleMonthlyReport, VehicleOdometer, VehicleRegisterOptions, VehicleStartOptions, VehicleStatus, VehicleStatusOptions, VehicleTargetSOC, VehicleWindowsOptions } from '../interfaces/common.interfaces';
import { AustraliaController } from '../controllers/australia.controller';
import { EUDatedDriveHistory, EUDriveHistory, EUPOIInformation, historyDrivingPeriod } from '../interfaces/european.interfaces';
import { Vehicle } from './vehicle';
export default class AustraliaVehicle extends Vehicle {
    vehicleConfig: VehicleRegisterOptions;
    controller: AustraliaController;
    region: REGIONS;
    serverRates: {
        max: number;
        current: number;
        reset?: Date;
        updatedAt?: Date;
    };
    constructor(vehicleConfig: VehicleRegisterOptions, controller: AustraliaController);
    /**
     *
     * @param config - Vehicle start configuration for the request
     * @returns Promise<string>
     * @remarks - not sure if this supports starting ICE vehicles
     */
    start(config: VehicleStartOptions): Promise<string>;
    stop(): Promise<string>;
    lock(): Promise<string>;
    unlock(): Promise<string>;
    setWindows(config: VehicleWindowsOptions): Promise<string>;
    fullStatus(input: VehicleStatusOptions): Promise<FullVehicleStatus | null>;
    status(input: VehicleStatusOptions): Promise<VehicleStatus | RawVehicleStatus | null>;
    odometer(): Promise<VehicleOdometer | null>;
    location(): Promise<VehicleLocation>;
    startCharge(): Promise<string>;
    stopCharge(): Promise<string>;
    monthlyReport(month?: {
        year: number;
        month: number;
    }): Promise<DeepPartial<VehicleMonthlyReport> | undefined>;
    tripInfo(date: {
        year: number;
        month: number;
        day: number;
    }): Promise<DeepPartial<VehicleDayTrip>[] | undefined>;
    tripInfo(date?: {
        year: number;
        month: number;
    }): Promise<DeepPartial<VehicleMonthTrip> | undefined>;
    driveHistory(period?: historyDrivingPeriod): Promise<DeepPartial<{
        cumulated: EUDriveHistory[];
        history: EUDatedDriveHistory[];
    }>>;
    /**
     * Warning: Only works on EV
     */
    getChargeTargets(): Promise<DeepPartial<VehicleTargetSOC>[] | undefined>;
    /**
     * Warning: Only works on EV
     */
    setChargeTargets(limits: {
        fast: ChargeTarget;
        slow: ChargeTarget;
    }): Promise<void>;
    /**
     * Define a navigation route
     * @param poiInformations The list of POIs and waypoint to go through
     */
    setNavigation(poiInformations: EUPOIInformation[]): Promise<void>;
    private updateRates;
}
