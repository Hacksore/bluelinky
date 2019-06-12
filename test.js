// TODO: remove dep
require('dotenv').config();
const bluelinky = require('./index');

async function test() {
	const token = await bluelinky.getToken({
		email: process.env.EMAIL,
		password: process.env.PASSWORD,
		vin: process.env.VIN,
		pin: process.env.PIN
	});

	const test = await bluelinky.apiUsageStatus(token, {
		email: process.env.EMAIL,
		vin: process.env.VIN,
		pin: process.env.PIN
	});
	console.log(test);
}

test();
