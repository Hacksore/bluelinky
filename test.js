/* eslint-disable */
const config = require('./config.json');
const BlueLinky = require('./dist/index');

const { username, password, pin, vin } = config;
const client = new BlueLinky({
  username,
  password,
  region: 'US',
  pin
});

const onReadyHandler = async () => {
  try {
    const vehicle = client.getVehicle(vin);
    const response = await vehicle.stop();
    console.log(response);
  } catch (err) {
    console.log('error', err.body);
  }
};


client.on('ready', onReadyHandler);

//manual way
// client.login()
//   .then(() => {
//     const vehicle = client.getVehicle(vin);
//     return vehicle.status();
//   })
//   .then(status => console.log(status))
//   .catch(err => console.log(err));
