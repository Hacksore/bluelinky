const config = require('./config.json');
const BlueLinky = require('./dist/index');

const { username, password, vin, pin } = config;
const client = new BlueLinky({
	username,
  password,
	region: 'EU'
});

client.login();

client.on('ready', async () => {
	const vehicle = await client.registerVehicle({ vin, pin });
  const status = await vehicle.status();  
  console.log(status);
});
