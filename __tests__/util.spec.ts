import { tempCodeToCelsius, celciusToTempCode, parseDate, addMinutes } from '../src/util';
import { REGIONS } from '../src/constants';

describe('Utility', () => {
  it('converts temp code to celsius in CA', () => {
    expect(tempCodeToCelsius(REGIONS.CA, '04H')).toEqual(18);
    expect(tempCodeToCelsius(REGIONS.CA, '0BH')).toEqual(21.5);
    expect(tempCodeToCelsius(REGIONS.CA, '10H')).toEqual(24);
    expect(tempCodeToCelsius(REGIONS.CA, '18H')).toEqual(28);
    expect(tempCodeToCelsius(REGIONS.CA, '20H')).toEqual(32);
  });
  
  it('converts celsius to temp code in CA', () => {
    expect(celciusToTempCode(REGIONS.CA, 18)).toEqual('04H');
    expect(celciusToTempCode(REGIONS.CA, 21.5)).toEqual('0BH');
    expect(celciusToTempCode(REGIONS.CA, 24)).toEqual('10H');
    expect(celciusToTempCode(REGIONS.CA, 28)).toEqual('18H');
    expect(celciusToTempCode(REGIONS.CA, 32)).toEqual('20H');
  });

  it('converts temp code to celsius in EU', () => {
    expect(tempCodeToCelsius(REGIONS.EU, '06H')).toEqual(17);
    expect(tempCodeToCelsius(REGIONS.EU, '0CH')).toEqual(20);
    expect(tempCodeToCelsius(REGIONS.EU, '1AH')).toEqual(27);
  });

  it('converts celcius to temp code in EU', () => {
    expect(celciusToTempCode(REGIONS.EU, 17)).toEqual('06H');
    expect(celciusToTempCode(REGIONS.EU, 20)).toEqual('0CH');
    expect(celciusToTempCode(REGIONS.EU, 27)).toEqual('1AH');
  });

  it('parseDate converts string to date', () => {
    expect(parseDate('20210118153031')).toEqual(new Date('2021-01-18:15:30:31'));
  });

  it('addTime can add minutes to a date', () => {
    const start = new Date('2021-01-18:12:00:00');
    expect(addMinutes(start, 30)).toEqual(new Date('2021-01-18:12:30:00'));
  });
});
