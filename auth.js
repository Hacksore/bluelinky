/* eslint-disable */

// test login for each region
const BlueLinky = require('./dist/index');
const { HYUNDAI_USER, HYUNDAI_PASS, HYUNDAI_PIN } = process.env;
const REGION_TO_TEST = process.argv[2];

const testRegionLogin = region => {
  const client = new BlueLinky({
    username: HYUNDAI_USER,
    password: HYUNDAI_PASS,
    region: region,
    pin: HYUNDAI_PIN,
    deviceUuid: 'e8db10f3-7190-42ca-91db-7a6af6e5ea1f',
  });

  client.on('ready', () => {
    console.log(`🦮 Connected to ${region} successfully 😎`);
  });
};

try {
  testRegionLogin(REGION_TO_TEST);
} catch (error) {
  console.log(error);
  // exit with an error so the build job fails
  process.exit(1);
}
