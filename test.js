const config = require('./config.json');
const BlueLinky = require('./dist/index');

const authCreds = {
	username: config.username,
	password: config.password
}

const test = async () => {
	console.log(BlueLinky)
	const client = new BlueLinky(authCreds);
	// do login
	await client.login();

	const vehicle = await client.registerVehicle(config.vin, config.pin);
	const status = await vehicle.status();

	console.log(status);
}

test();
