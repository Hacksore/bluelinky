// TODO: remove dep
require('dotenv').config();

const BlueLinky = require('./index');

const bluelinky = new BlueLinky({
	username: process.env.EMAIL,
	password: process.env.PASSWORD,
	vin: process.env.VIN,
	pin: process.env.PIN
});

async function test() {
	// const res = await bluelinky.lockVehicle();
	// console.log(res);

	const res = await bluelinky.startVehicle({
		airCtrl: true,
		igniOnDuration: 1,
  	airTempvalue: 70,
		defrost: false,
		heating1: false
	});

	console.log(res);
}

test();
