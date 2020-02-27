/* eslint-disable */
const config = require('./config.json');
const BlueLinky = require('./dist/index');

const { username, password, vin, pin, deviceUuid } = config;
const client = new BlueLinky({
	username,
  password,
	region: 'US',
	pin,
	deviceUuid
});

client.login()
.then(async (res) => {
  console.log('response:', res);

	const vehicles = await client.getVehicles();
  // console.log('veh', vehicles)
  const vehicle = vehicles[0];
  const status = await vehicle.getStatus();
  console.log(status);

});
