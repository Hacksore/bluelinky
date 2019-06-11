require('dotenv').config();
const { lockVehicle, startVehicle }  = require('./index');

const config = {
	email: process.env.EMAIL,
	password: process.env.PASSWORD,
	vin: process.env.VIN,
	pin: process.env.PIN
}

async function test() {
	const test = await startVehicle(config);

	console.log(test)
}

test();
