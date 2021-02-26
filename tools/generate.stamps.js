const { join, resolve } = require('path');
const { writeFileSync } = require('fs');
const { getStamp } = require('./european.tools.js');

const SIZE = 1000;
const APP_ID = '99cfff84-f4e2-4be8-a5ed-e5b755eb6581';

const run = async () => {
  const array = new Array(SIZE).fill('');
  const baseDate = Date.now();

  for (let i = SIZE; --i >= 0;) {
    const date = i % 2 === 0 ? baseDate + (i * 1000) : baseDate - (i * 1000);
    array[i] = await getStamp(`${APP_ID}:${date}`);
    console.clear();
    console.log(`${SIZE - i}/${SIZE}`)
  }

  writeFileSync(join(resolve('.'), 'src', 'tools', 'european.token.collection.ts'), `export default ${JSON.stringify(array)}`);
}

run().catch((err) => console.error(err));
