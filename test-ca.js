/* eslint-disable */
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
	
	// we register and wait for a vehicle to get its features
	const vehicle = await client.registerVehicle({
		vin: config.vin, 
		pin: config.pin
	});

	// call the status method
	try {
		const status = await vehicle.status(false);
		console.log('status : ' + JSON.stringify(status, null, 2));

		const statusR = await vehicle.status(true);
		console.log('status remote : ' + JSON.stringify(statusR, null, 2));

		const myAccount = await vehicle.myAccount();
		console.log('myAccount : ' + JSON.stringify(myAccount, null, 2));

		const vehicleInfo = await vehicle.vehicleInfo();
		console.log('vehicleInfo : ' + JSON.stringify(vehicleInfo, null, 2));

		const nextService = await vehicle.status();
		console.log('nextService : ' + JSON.stringify(nextService, null, 2));

		const preferedDealer = await vehicle.status();
		console.log('preferedDealer : ' + JSON.stringify(preferedDealer, null, 2));

		// const lockRes = await vehicle.lock();
		// console.log('lock : ' + JSON.stringify(lockRes, null, 2));

		// const unlockRes = await vehicle.unlock();
		// console.log('unlock : ' + JSON.stringify(unlockRes, null, 2));
		
		
		// const startRes = await vehicle.start({});
		// console.log('start : ' + JSON.stringify(startRes, null, 2));

		// const stopRes = await vehicle.stop();
		// console.log('stop : ' + JSON.stringify(stopRes, null, 2));

	} catch (err) {
		console.log(err);
	}
}

test();
