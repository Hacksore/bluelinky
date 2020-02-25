const config = require('./config.json');
const BlueLinky = require('./dist/index');

const { username, password, vin, pin } = config;
const client = new BlueLinky({
	username,
  password,
	region: 'EU'
});

client.login().then( async () => {
	const vehicles = await client.getVehicles();
	console.log(vehicles[0].Name);
});

client.on('ready', async () => {
	// const vehicle = await client.registerVehicle({ vin, pin });
  // const status = await vehicle.status();  
  // console.log(status);
});
