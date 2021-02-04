const dec2hexString = (dec: number) => '0x' + dec.toString(16).substr(-4).toUpperCase();

const floatRange = (start, stop, step) => {
  const ranges: Array<number> = [];
  for (let i = start; i <= stop; i += step) {
    ranges.push(i);
  }
  return ranges;
};

// Converts Kia's stupid temp codes to celsius
// From what I can tell it uses a hex index on a list of temperatures starting at 14c ending at 30c with an added H on the end,
// I'm thinking it has to do with Heat/Cool H/C but needs to be tested, while the car is off, it defaults to 01H
export const celciusToTempCode = (temperature: number): string => {
  // create a range of floats
  const tempRange = floatRange(14, 30, 0.5);

  // get the index from the celcious degre
  const tempCodeIndex = tempRange.indexOf(temperature);

  // convert to hex
  const hexCode = dec2hexString(tempCodeIndex);

  // get the second param and stick an H on the end?
  // this needs more testing I guess :P
  return hexCode.split('x')[1].toUpperCase() + 'H';
};

export const tempCodeToCelsius = (code: string): number => {
  // get first part
  const hexTempIndex = code[0];

  // create a range
  const tempRange = floatRange(14, 30, 0.5);

  // get the index
  const tempIndex = parseInt(hexTempIndex, 16);

  // return the relevant celsius temp
  return tempRange[tempIndex];
};
