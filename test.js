const config = require('./config.json');
const BlueLinky = require('./dist/index');

const authCreds = {
	username: config.username,
	password: config.password
}

const test = async () => {
	const client = await BlueLinky.login(authCreds);
	const vehicle = await client.registerVehicle(config.vin, config.pin);

	//const status = await vehicle.status();

	console.log(vehicle.getFeatures());

}
test();
