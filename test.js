/* eslint-disable */
const config = require('./config.json');
const BlueLinky = require('./dist/index');
const inquirer = require('inquirer');

const client = new BlueLinky({
  region: 'US',
  ...config,
});

const apiCalls = [
  { name: 'exit', value: 'exit' },
  { name: 'start', value: 'start' },
  { name: 'stop', value: 'stop' },
  { name: 'status (on bluelink cache)', value: 'status' },
  { name: 'status refresh (fetch vehicle)', value: 'statusR' },
  { name: 'lock', value: 'lock' },
  { name: 'unlock', value: 'unlock' },
  { name: 'locate', value: 'locate' },
];

let vehicle;

const onReadyHandler = async vehicles => {
  vehicle = await client.getVehicle();
  askForInput();
};
client.on('ready', onReadyHandler);

function askForInput() {
  console.log('');
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'command',
        message: 'What you wanna do?',
        choices: apiCalls,
      },
    ])
    .then(answers => {
      if (answers.command == 'exit') {
        console.log('bye');
        return;
      } else {
        performCommand(answers.command);
      }
    });
}

async function performCommand(command) {
  try {
    switch (command) {
      case 'exit':
        return;
      case 'locate':
        const locate = await vehicle.locate();
        console.log('locate : ' + JSON.stringify(locate, null, 2));
        break;
      case 'status':
        const status = await vehicle.status(false);
        console.log('status : ' + JSON.stringify(status, null, 2));
        break;
      case 'statusR':
        const statusR = await vehicle.status(true);
        console.log('status remote : ' + JSON.stringify(statusR, null, 2));
        break;
      case 'start':
        const startRes = await vehicle.start({
          airCtrl: false,
          igniOnDuration: 10,
          airTempvalue: 70,
          defrost: false,
          heating1: false,
        });
        console.log('start : ' + JSON.stringify(startRes, null, 2));
        break;
      case 'stop':
        const stopRes = await vehicle.stop();
        console.log('stop : ' + JSON.stringify(stopRes, null, 2));
        break;
      case 'lock':
        const lockRes = await vehicle.lock();
        console.log('lock : ' + JSON.stringify(lockRes, null, 2));
        break;
      case 'unlock':
        const unlockRes = await vehicle.unlock();
        console.log('unlock : ' + JSON.stringify(unlockRes, null, 2));
        break;
    }

    askForInput();
  } catch (err) {
    console.log(err);
  }
}
