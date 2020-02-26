const config = require('./config.json');
// const BlueLinky = require('bluelinky');
const BlueLinky = require('./dist/index');
const inquirer = require('inquirer');

const authCreds = {
    username: config.username,
    password: config.password
}

const apiCalls = [
    { name: 'exit', value: 'exit' },
    { name: 'locate', value: 'locate' },
    { name: 'status (on bluelink)', value: 'status' },
    { name: 'status refresh (fetch vehicle)', value: 'statusR' },
    { name: 'start', value: 'start' },
    { name: 'stop', value: 'stop' },
    { name: 'lock', value: 'lock' },
    { name: 'unlock', value: 'unlock' },
    { name: 'honk', value: 'honk' },
    { name: 'light', value: 'light' },
    { name: 'myAccount', value: 'myAccount' },
    { name: 'vehicleInfo', value: 'vehicleInfo' },
    { name: 'nextService', value: 'nextService' },
    { name: 'preferedDealer', value: 'preferedDealer' },
]

var vehicle

const login = async() => {
    const client = new BlueLinky(authCreds);

    const auth = await client.login({ region: 'CA' });
    // console.log('login : ' + JSON.stringify(auth, null, 2));

    // we register
    vehicle = await client.registerVehicle({
        vin: config.vin,
        pin: config.pin
    });

    askForInput();
}

function askForInput() {
    console.log("")
    inquirer
        .prompt([{
            type: 'list',
            name: 'command',
            message: "What you wanna do?",
            choices: apiCalls
        }])
        .then(answers => {
            if (answers.command == 'exit') {
                console.log('bye')
                return
            } else {
                performCommand(answers.command)
            }
        })
}

async function performCommand(command) {
    try {
        switch (command) {
            case 'exit':
                return
            case 'locate':
                const location = await vehicle.locate();
                console.log('locate : ' + JSON.stringify(location, null, 2));
                break
            case 'status':
                const status = await vehicle.status(false);
                console.log('status : ' + JSON.stringify(status, null, 2));
                break
            case 'statusR':
                const statusR = await vehicle.status(true);
                console.log('status remote : ' + JSON.stringify(statusR, null, 2));
                break
            case 'start':
                const startRes = await vehicle.start({
                    airCtrl: true,
                    airTempvalue: 17,
                    defrost: true,
                    heating1: true
                });
                console.log('start : ' + JSON.stringify(startRes, null, 2));
                break
            case 'stop':
                const stopRes = await vehicle.stop();
                console.log('stop : ' + JSON.stringify(stopRes, null, 2));
                break
            case 'lock':
                const lockRes = await vehicle.lock();
                console.log('lock : ' + JSON.stringify(lockRes, null, 2));
                break
            case 'unlock':
                const unlockRes = await vehicle.unlock();
                console.log('unlock : ' + JSON.stringify(unlockRes, null, 2));
                break
            case 'honk':
                const honkRes = await vehicle.lights(true);
                console.log('honk : ' + JSON.stringify(honkRes, null, 2));
                break
            case 'light':
                const lightRes = await vehicle.lights();
                console.log('ilght : ' + JSON.stringify(lightRes, null, 2));
                break
            case 'myAccount':
                const myAccount = await vehicle.myAccount();
                console.log('myAccount : ' + JSON.stringify(myAccount, null, 2));
                break
            case 'vehicleInfo':
                const vehicleInfo = await vehicle.vehicleInfo();
                console.log('vehicleInfo : ' + JSON.stringify(vehicleInfo, null, 2));
                break
            case 'nextService':
                const nextService = await vehicle.status();
                console.log('nextService : ' + JSON.stringify(nextService, null, 2));
                break
            case 'preferedDealer':
                const preferedDealer = await vehicle.status();
                console.log('preferedDealer : ' + JSON.stringify(preferedDealer, null, 2));
                break
        }

        askForInput()

    } catch (err) {
        console.log(err);
    }
}

login();