# Bluelinky
An API wrapper for Hyundai bluelink

# Example
```javascript
const bluelinky = require('bluelinky');

const token = await bluelinky.getToken({
	email: process.env.EMAIL,
	password: process.env.PASSWORD,
	vin: process.env.VIN,
	pin: process.env.PIN
});

const test = await bluelinky.lockVehicle(token, {
	email: process.env.EMAIL,
	vin: process.env.VIN,
	pin: process.env.PIN
});
console.log(test);
```

## Supported Features
- [X] Lock
- [X] Unlock
- [X] Start
- [X] Stop
- [X] Health
- [X] Flash Lights
- [X] Status
- [ ] Valet Mode?
- [ ] Speed Alert?
- [ ] Geofencing?


## Observations
Seems the API has daily limits for commands, unsure of the numbers yet.

`You have exceeded the daily remote service request limit. Your last request was not processed`
