/* eslint-disable */

// test login for each region
const BlueLinky = require('./dist/index');
const { HYUNDAI_USER, HYUNDAI_PASS, HYUNDAI_PIN } = process.env;

const testRegionLogin = (region) => {
  const client = new BlueLinky({
    username: HYUNDAI_USER,
    password: HYUNDAI_PASS,
    region: region,
    pin: HYUNDAI_PIN,
    deviceUuid: 'e8db10f3-7190-42ca-91db-7a6af6e5ea1f',
  });
  client.on('ready', () => {
    console.log(`Connected to region ${region} successfuly`);
  });
};

['US', 'EU'].map((region) => testRegionLogin(region));
