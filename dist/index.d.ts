/// <reference types="node" />
import { AmericanBlueLinkyConfig } from './controllers/american.controller';
import { EuropeBlueLinkyConfig } from './controllers/european.controller';
import { CanadianBlueLinkyConfig } from './controllers/canadian.controller';
import { ChineseBlueLinkConfig } from './controllers/chinese.controller';
import { EventEmitter } from 'events';
import { Session } from './interfaces/common.interfaces';
import { REGIONS } from './constants';
import AmericanVehicle from './vehicles/american.vehicle';
import EuropeanVehicle from './vehicles/european.vehicle';
import CanadianVehicle from './vehicles/canadian.vehicle';
import ChineseVehicle from './vehicles/chinese.vehicle';
import { Vehicle } from './vehicles/vehicle';
declare type BluelinkyConfigRegions = AmericanBlueLinkyConfig | CanadianBlueLinkyConfig | EuropeBlueLinkyConfig | ChineseBlueLinkConfig;
declare class BlueLinky<T extends BluelinkyConfigRegions = AmericanBlueLinkyConfig, REGION = T['region'], VEHICLE_TYPE extends Vehicle = REGION extends REGIONS.US ? AmericanVehicle : REGION extends REGIONS.CA ? CanadianVehicle : REGION extends REGIONS.CN ? ChineseVehicle : EuropeanVehicle> extends EventEmitter {
    private controller;
    private vehicles;
    private config;
    constructor(config: T);
    on(event: 'ready', fnc: (vehicles: VEHICLE_TYPE[]) => void): this;
    on(event: 'error', fnc: (error: any) => void): this;
    private onInit;
    login(): Promise<string>;
    getVehicles(): Promise<VEHICLE_TYPE[]>;
    /**
     * Allows you to access a vehicle in your account by VIN
     * @param input - The VIN for the vehicle
     * @returns Vehicle
     */
    getVehicle(input: string): VEHICLE_TYPE | undefined;
    refreshAccessToken(): Promise<string>;
    logout(): Promise<string>;
    getSession(): Session | null;
    get cachedVehicles(): VEHICLE_TYPE[];
}
export default BlueLinky;
