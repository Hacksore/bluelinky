const { join, resolve } = require('path');
const { writeFileSync } = require('fs');
const { getStamps } = require('./european.tools.js');

const SIZE = 1000;

const generateStampsForBrand = async (brand) => {
  const stamps = await getStamps(brand);
  const array = stamps.slice(1, SIZE + 1);

  writeFileSync(
    join(resolve('.'), 'src', 'tools', `european.${brand}.token.collection.ts`),
    `/* eslint-disable */
    export default ${JSON.stringify(array, undefined, 4)};`
  );
};

generateStampsForBrand('hyundai').catch((err) => console.error(err));
generateStampsForBrand('kia').catch((err) => console.error(err));
