const config = require('./config.json');
const BlueLinky = require('./index');

const authCreds = {
	username: config.username,
	password: config.password
}

async function test() {

	const client = await BlueLinky.login(authCreds);
	const vehicle = await client.registerVehicle(config.vin, config.pin);

	//const res = await vehicle.lock();
	//const res = await vehicle.status();
	//console.log(res);
}

test();
