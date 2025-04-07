export interface EuropeanEndpoints {
    session: string;
    login: string;
    redirect_uri: string;
    token: string;
}
export interface EUPOIInformation {
    phone: string;
    waypointID: number;
    lang: 1;
    src: 'HERE';
    coord: {
        lat: number;
        alt: number;
        lon: number;
        type: 0;
    };
    addr: string;
    zip: string;
    placeid: string;
    name: string;
}
export declare enum historyDrivingPeriod {
    DAY = 0,
    MONTH = 1,
    ALL = 2
}
export declare enum historyCumulatedTypes {
    TOTAL = 0,
    AVERAGE = 1,
    TODAY = 2
}
export interface EUDriveHistory {
    period: historyCumulatedTypes;
    consumption: {
        total: number;
        engine: number;
        climate: number;
        devices: number;
        battery: number;
    };
    regen: number;
    distance: number;
}
export interface EUDatedDriveHistory extends Omit<EUDriveHistory, 'period'> {
    period: historyDrivingPeriod;
    rawDate: string;
    date: Date;
}
