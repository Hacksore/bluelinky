/* eslint-disable */
const config = require('./config.json');
const BlueLinky = require('./dist/index');

const { username, password, vin, pin, deviceUuid } = config;
const client = new BlueLinky({
	username,
  password,
	region: 'EU',
	pin,
	deviceUuid
});

client.login().then(res => {
	console.log('response:', res);

	client.getVehicles()
		.then(res => console.log(res))
		.catch(err => console.log(err));
});
