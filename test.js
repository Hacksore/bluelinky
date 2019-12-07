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
	const auth = await client.login();
	
	// we register and wait for a vehicle to get its features
	const vehicle = await client.registerVehicle(config.vin, config.pin);

	// call the status method
	const status = await vehicle.status();
	console.log(status);
}

test();

// const express = require("express");
// const BlueLinky = require('./dist/index');
// const bodyParser = require("body-parser");

// const config = require('./config.json');

// const app = express();
// app.use(bodyParser.json());

// let client;
// let vehicle;

// const middleWare = async (req, res, next) => {
//   const ip = req.connection.remoteAddress;
//   console.log(req.path, ip);

//   if (req.body.VALIDATION_KEY !== config.validation_key) {
//     console.log("Bad key used by: " + ip);
//     return res.send({ error: "bad key" });
//   }

//   if (client === undefined) {
//     client = new BlueLinky({
//       username: config.username,
//       password: config.password
//     });

//     //login
//     await client.login();

//     vehicle = await client.registerVehicle(config.vin, config.pin);
//   }

//   return next();
// };

// app.use(middleWare);

// app.post("/start", async (req, res) => {
//   let response;
//   try {
//     response = await vehicle.start({
//       airCtrl: true,
//       igniOnDuration: 10,
//       airTempvalue: 60
//     });
//   } catch (e) {
//     response = {
//       error: e.message
//     };
//   }
//   res.send(response);
// });

// app.post("/lock", async (req, res) => {
//   let response;
//   try {
//     response = await vehicle.lock();
//   } catch (e) {
//     console.log(e);
//     response = {
//       error: e.message
//     };
//   }
//   res.send(response);
// });

// app.post("/status", async (req, res) => {
//   let response;
//   try {
//     response = await vehicle.status();
//   } catch (e) {
//     console.log(e);
//     response = {
//       error: e.message
//     };
//   }
//   res.send(response);
// });

// app.listen(8080, "0.0.0.0");
