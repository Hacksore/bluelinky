<h1 align="center">Welcome to bluelinky 👋</h1>
<p>
  <img src="https://img.shields.io/badge/version-4.0.0-alpha-2-blue.svg?cacheSeconds=2592000" />
</p>

> An unoffcial API wrapper for Hyundai bluelink

## Install

```sh
npm install
```


# Example
```javascript
const BlueLinky = require('bluelinky');

(async () => {

	const client = new BlueLinky({
		username: 'someguy@gmail.com',
		password: 'password'
	);

	// Perform the login so we can fetch a token
	await client.login();

	const vehicle = await client.registerVehicle('JH4KA7650MC002609', '1111');
	const status = await vehicle.status(true);

	console.log(status);

})();

```

## Supported Features
- [X] Lock
- [X] Unlock
- [X] Start
- [X] Stop
- [X] Health
- [X] Flash Lights
- [X] Panic
- [X] API Stats
- [X] Vehicle Status
- [X] Account Info
- [X] Account Messages
- [X] Enrollment Status
- [X] Vehicle Service Info
- [X] Pin Status

## Responses
You can find JSON response captures in the docs folder for analysing

## Observations
Seems the API has daily limits for commands, unsure of the numbers yet.

## Show your support

Give a ⭐️ if this project helped you!
