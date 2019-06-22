const config = require('./config.json');
const BlueLinky = require('bluelinky');
//const BlueLinky = require('./dist/index');


const authCreds = {
	username: config.username,
	password: config.password
}

const test = async () => {
	console.log(BlueLinky)
	const client = new BlueLinky(authCreds);

	// do login
	const auth = await client.login();
	
	// we register and wait for a vehicle to get its features
	const vehicle = await client.registerVehicle(config.vin, config.pin);

	// call the status method
	const status = await vehicle.status();
	console.log(status);
	//console.log('Distance left in vehicle', status.result.dte.value)

}

test();
