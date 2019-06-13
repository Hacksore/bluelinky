# Bluelinky
An API wrapper for Hyundai bluelink

# Example
```javascript
const BlueLinky = require('bluelinky');

const bluelinky = new BlueLinky({
	username: process.env.EMAIL,
	password: process.env.PASSWORD,
	vin: process.env.VIN,
	pin: process.env.PIN
});

const response = await bluelinky.lockVehicle();

console.log(response);
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
