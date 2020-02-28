/* eslint-disable */
const config = require('./config.json');
const BlueLinky = require('./dist/index');

const { username, password, vin, pin, deviceUuid } = config;
const client = new BlueLinky({
	username,
  password,
	region: 'US',
	pin,
  deviceUuid,
  // autoLogin: false // if you wanted to handle login yourself for some reason change this
});

client.on('ready', async (vehicles) => {
  // const vehicles = await client.getVehicles();
  // console.log(vehicles[0].status());
  // const vehicle = vehicles[0];

  const status = await vehicles[0].status();
  console.log(status)
});

// manually way
// client.login()
// .then(async (res) => {
//   const vehicles = await client.getVehicles();
//   const vehicle = vehicles[0];
//   const status = await vehicle.getStatus();
//   console.log(status);
// });
