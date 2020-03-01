/* eslint-disable */
const config = require('./config_eu.json');
const BlueLinky = require('./dist/index');

const { username, password, vin, pin, deviceUuid } = config;
const client = new BlueLinky({
	username,
  password,
	region: 'EU',
	pin,
	deviceUuid
});

const onReadyHandler = async (vehicles) => {
	await client.enterPin();
  vehicles.forEach(car => {
		console.log(car.vin);
		console.log(car.gen);
	})
}
client.on('ready', onReadyHandler);
