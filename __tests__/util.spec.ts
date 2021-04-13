import { tempCodeToCelsius, celciusToTempCode, parseDate, addMinutes } from '../src/util';

describe('Utility', () => {
  it('converts temp code to celsius', () => {
    expect(tempCodeToCelsius('0H')).toEqual(14);
    expect(tempCodeToCelsius('AH')).toEqual(19);
  });

  it('converts celsius to temp code', () => {
    expect(celciusToTempCode(14)).toEqual('0H');
    expect(celciusToTempCode(19)).toEqual('AH');
  });

  it('parseDate converts string to date', () => {
    expect(parseDate('20210118153031')).toEqual(new Date('2021-01-18:15:30:31'));
  });

  it('addTime can add minutes to a date', () => {
    const start = new Date('2021-01-18:12:00:00');
    expect(addMinutes(start, 30)).toEqual(new Date('2021-01-18:12:30:00'));
  });
});
