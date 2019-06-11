require('dotenv').config();
const { lockVehicle}  = require('./index');

const config = {
	email: process.env.EMAIL,
	password: process.env.PASSWORD,
	vin: process.env.VIN,
	pin: process.env.PIN
}

async function test() {
	const test = await lockVehicle(config);

	console.log(test)
}

test();
