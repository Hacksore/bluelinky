# bluelinky

> An unoffcial API wrapper for Hyundai BlueLink

[![CI](https://img.shields.io/circleci/build/github/Hacksore/bluelinky.svg)](https://circleci.com/gh/Hacksore/bluelinky/tree/master)
[![npm](https://img.shields.io/npm/v/bluelinky.svg)](https://www.npmjs.com/package/bluelinky)
[![Discord](https://img.shields.io/discord/652755205041029120)](https://discord.gg/HwnG8sY)

## Install
```sh
npm install bluelinky
```

## Example
```javascript
const BlueLinky = require('bluelinky');

const client = new BlueLinky({
  username: 'someguy@example.com',
  password: 'hunter1',
  region: 'US',
  pin: '1234'
});

client.on('ready', async () => {
  const vehicle = client.getVehicle('5NMS55555555555555');
  const response = await vehicle.lock();
  console.log(response);
});

```

## Supported Features
- Lock
- Unlock
- Start (with climate control)
- Stop

## Supported Regions
| [Regions](https://github.com/Hacksore/bluelinky/wiki/Regions) | Current Status |
|-----------|--------------|
| USA       | Working      |
| Canada    | WIP (soon™)  |
| Europe    | WIP (soon™)  |
| Korea     | ▯▯▯▯▯▯  |
| Australia | sorry m8     |

## Show your support

Give a ⭐️ if this project helped you!

## contributors

@altagir - Helping make Canada work

@SondreNjaastad - Helping make Europe wrok
