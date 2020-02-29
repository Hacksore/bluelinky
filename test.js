/* eslint-disable */
const config = require('./config.json');
const BlueLinky = require('./dist/index');

const { username, password, pin, vin } = config;
const client = new BlueLinky({
	username,
  password,
	region: 'US',
	pin,
  autoLogin: false // if you wanted to handle login yourself for some reason change this
});

// client.on('ready', async (vehicles) => {
//   const vehicle = client.getVehicle(vin);
//   const response = await vehicle.status();
//   console.log(response);
// });

// manual way
client.login()
.then(async (res) => {
  console.log(res);
  const vehicle = client.getVehicle(vin);
  console.log(vehicle);
  // const response = await vehicle.status();
  // console.log(response);
});
