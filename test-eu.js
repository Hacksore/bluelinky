const config = require('./config.json');
const BlueLinky = require('./dist/index');

const { username, password, vin, pin } = config;
const client = new BlueLinky({
	username,
  password,
	region: 'EU',
	pin
});

client.login().then( async () => {
	const vehicles = await client.getVehicles();
	await client.enterPin();
	await vehicles[0].Lock();
});
