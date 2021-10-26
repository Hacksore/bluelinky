import { REGION } from './constants';

const dec2hexString = (dec: number) => '0x' + dec.toString(16).substr(-4).toUpperCase();

const floatRange = (start, stop, step) => {
  const ranges: Array<number> = [];
  for (let i = start; i <= stop; i += step) {
    ranges.push(i);
  }
  return ranges;
};

const REGION_STEP_RANGES = {
  EU: {
    start: 14,
    end: 30,
    step: 0.5,
  },
  CA: {
    start: 16,
    end: 32,
    step: 0.5,
  }
};

// Converts Kia's stupid temp codes to celsius
// From what I can tell it uses a hex index on a list of temperatures starting at 14c ending at 30c with an added H on the end,
// I'm thinking it has to do with Heat/Cool H/C but needs to be tested, while the car is off, it defaults to 01H
export const celciusToTempCode = (region: REGION, temperature: number): string => {
  // create a range of floats
  const { start, end, step } = REGION_STEP_RANGES[region];
  const tempRange = floatRange(start, end, step);

  // get the index from the celcious degre
  const tempCodeIndex = tempRange.indexOf(temperature);

  // convert to hex
  const hexCode = dec2hexString(tempCodeIndex);

  // get the second param and stick an H on the end?
  // this needs more testing I guess :P
  return `${hexCode.split('x')[1].toUpperCase()}H`.padStart(3, '0');
};

export const tempCodeToCelsius = (region: REGION, code: string): number => { 
  // create a range
  const { start, end, step } = REGION_STEP_RANGES[region];
  const tempRange = floatRange(start, end, step);

  // get the index
  const tempIndex = parseInt(code, 16);

  // return the relevant celsius temp
  return tempRange[tempIndex];
};

/**
 * Parses an API date string
 * @param str the date in yyyyMMdd or yyyyMMddHHmmss format
 * @returns The parsed date
 */
export const parseDate = (str: string): Date => {
	const year = parseInt(str.substring(0, 4));
	const month = parseInt(str.substring(4, 6));
	const day = parseInt(str.substring(6, 8));
  if (str.length <= 8) {
    return new Date(year, month - 1, day);
  }
	const hour = parseInt(str.substring(8, 10));
	const minute = parseInt(str.substring(10, 12));
	const second = parseInt(str.substring(12, 14));
	return new Date(year, month - 1, day, hour, minute, second);
};

const MILISECONDS_PER_SECOND = 1000;
const MILISECONDS_PER_MINUTE = MILISECONDS_PER_SECOND * 60;

/**
 * Adds a certain amount of minutes to a date
 * @param date The date to adds minutes to
 * @param minutes The number of minutes to add
 * @returns The updated date
 */
export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + (minutes * MILISECONDS_PER_MINUTE));
};

