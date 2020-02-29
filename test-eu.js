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

client.on('ready', vehicles => {
	console.log(vehicles);
});
