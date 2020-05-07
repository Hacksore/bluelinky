/* eslint-disable */
const config = require('../config_eu.json');
const BlueLinky = require('../dist/index');

const { username, password, vin, pin, deviceUuid } = config;
const client = new BlueLinky({
	username,
  password,
	region: 'EU',
	pin,
	deviceUuid
});

const onReadyHandler = async (vehicles) => {
	const cars = vehicles;
	const res = await cars[0].status();
	console.log(res);
	setTimeout(async () => {
		await cars[0].lock();
		console.log('Car locked after 15 sec');
	}, 15000);
}
client.on('ready', onReadyHandler);
