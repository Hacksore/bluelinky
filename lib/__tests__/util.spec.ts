import { tempCodeToCelsius, celciusToTempCode } from '../util';

describe('Utility', () => {
  it('converts temp code to celsius', () => {
    expect(tempCodeToCelsius('0H')).toEqual(14);
    expect(tempCodeToCelsius('AH')).toEqual(19);
  });

  it('converts celsius to temp code', () => {
    expect(celciusToTempCode(14)).toEqual('0H');
    expect(celciusToTempCode(19)).toEqual('AH');
  });
});
