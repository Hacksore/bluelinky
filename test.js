const config = require('./config.json');
// const BlueLinky = require('bluelinky');
const BlueLinky = require('./dist/index');

const authCreds = {
	username: config.username,
	password: config.password
}

const test = async () => {
	console.log(BlueLinky)
	const client = new BlueLinky(authCreds);

	// do login
	const auth = await client.login({ region: 'CA' });
	console.log(auth);
	// we register and wait for a vehicle to get its features
	try {
		console.log('create')
		const vehicle = await client.registerVehicle({
			vin: config.vin, 
			pin: config.pin
		});
		console.log(vehicle)
		const status = await vehicle.status();
	} catch(e) {
		console.log('hi', e);
	}

	// console.log(vehicle)
	// call the status method


}

test();
