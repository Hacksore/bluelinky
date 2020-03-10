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

const onReadyHandler = async vehicles => {
  try {
    const vehicle = client.getVehicle(vin);
    const response = await vehicle.unlock();
    console.log(response);
  } catch (err) {
    console.log(err.body);
  }
};

const onReadyHandler = async(vehicles) => {
    const vehicle = client.getVehicle();
    const response = await vehicle.status();
    console.log(response);
}
client.on('ready', onReadyHandler);

//manual way
// client.login()
//   .then(() => {
//     const vehicle = client.getVehicle(vin);
//     return vehicle.status();
//   })
//   .then(status => console.log(status))
//   .catch(err => console.log(err));
