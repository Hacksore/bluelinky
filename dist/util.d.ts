import { REGION } from './constants';
export declare const celciusToTempCode: (region: REGION, temperature: number) => string;
export declare const tempCodeToCelsius: (region: REGION, code: string) => number;
/**
 * Parses an API date string
 * @param str the date in yyyyMMdd or yyyyMMddHHmmss format
 * @returns The parsed date
 */
export declare const parseDate: (str: string) => Date;
/**
 * Adds a certain amount of minutes to a date
 * @param date The date to adds minutes to
 * @param minutes The number of minutes to add
 * @returns The updated date
 */
export declare const addMinutes: (date: Date, minutes: number) => Date;
