const got = require('got');
const FormData = require('form-data');

const endpoints = {
  getToken: 'https://owners.hyundaiusa.com/etc/designs/ownercommon/us/token.json?reg=',
  validateToken: 'https://owners.hyundaiusa.com/libs/granite/csrf/token.json',
	auth: 'https://owners.hyundaiusa.com/bin/common/connectCar',
	remoteAction: 'https://owners.hyundaiusa.com/bin/common/remoteAction',
	usageStats: 'https://owners.hyundaiusa.com/bin/common/usagestats',
  health: 'https://owners.hyundaiusa.com/bin/common/VehicleHealthServlet',
};

function buildFormData(config) {
	const form = new FormData();
	for (const key in config) {
    form.append(key, config[key]);
  }
	return form;
}

/**
 * @description Use this to obtain an access token
 * @param {{vin: String, pin: String, email: String, password: String}} config the object config 
 * @returns {Promise<String>}
 */
async function getToken(config) {
  let response;

  const now = Math.floor(new Date() / 1000);
  response = await got({
    url: endpoints.getToken + now,
    method: 'GET',
    json: true
  });

  const token = response.body.token;

  response = await got({
    url: endpoints.validateToken,
    method: 'GET',
    headers: {
      'Cookie': `csrf_token=${token};`
    }
  });

  const formData = buildFormData({
    ':cq_csrf_token': token,
    'username': config.email,
    'password': config.password,
    'url': 'https://owners.hyundaiusa.com/us/en/index.html'
  });

	response = await got({
		url: endpoints.auth,
		method: 'POST',
		body: formData
	});

	const json = JSON.parse(response.body);
	return json.Token.access_token;

}

/**
 * 
 * @param {String} token the api token
 * @param {{vin: String, pin: string, email: string}} config the object config 
 * @returns {Promise<any>} something to return lol
 */
async function unlockVehicle(token, config) {

  const formData = buildFormData({
    vin: config.vin,
    username: config.email,
    token: token,
    pin: config.pin,
    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
    gen: 2,
    regId: config.vin,
		service: 'remoteunlock'
  });

  response = await got({
		url: endpoints.remoteAction,
		method: 'post',
		body: formData
	})

	return JSON.parse(response.body);
}

/**
 * 
 * @param {String} token the api token
 * @param {{vin: String, pin: string, email: string}} config the object config 
 * @returns {Promise<any>} something to return lol
 */
async function lockVehicle(token, config) {

  const formData = buildFormData({
    vin: config.vin,
    username: config.email,
    token: token,
    pin: config.pin,
    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
    gen: 2,
    regId: config.vin,
		service: 'remotelock'
  });

  response = await got({
		url: endpoints.remoteAction,
		method: 'post',
		body: formData
	})

	return JSON.parse(response.body);
}

/**
 * 
 * @param {String} token the api token
 * @param {{vin: String, pin: string, email: string}} config the object config 
 * @returns {Promise<any>} something to return lol
 */
async function startVehicle(token, config) {

  const formData = buildFormData({
    vin: config.vin,
    username: config.email,
    token: token,
    pin: config.pin,
    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
    gen: 2,
    regId: config.vin,
		service: 'ignitionstart',
		airCtrl: 'true',
		igniOnDuration: 10,
		airTempvalue: 70,
		defrost: 'false',
		heating1: 'false'
  });

  const response = await got({
		url: endpoints.remoteAction,
		method: 'post',
		body: formData
	})

	return JSON.parse(response.body);
}

/**
 * 
 * @param {String} token the api token
 * @param {{vin: String, pin: string, email: string}} config the object config 
 * @returns {Promise<any>} something to return lol
 */
async function stopVehicle(token, config) {

  const formData = buildFormData({
    vin: config.vin,
    username: config.email,
    token: token,
    pin: config.pin,
    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
    gen: 2,
    regId: config.vin,
		service: 'ignitionstop'
  });

  const response = await got({
		url: endpoints.remoteAction,
		method: 'post',
		body: formData,
	});

	return JSON.parse(response.body);
}

/**
 * 
 * @param {String} token the api token
 * @param {{vin: String, pin: string, email: string}} config the object config 
 * @returns {Promise<any>} something to return lol
 */
async function flashVehicleLights(token, config) {

  const formData = buildFormData({
    vin: config.vin,
    username: config.email,
    token: token,
    pin: config.pin,
    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
    gen: 2,
    regId: config.vin,
		service: 'light'
  });

  const response = await got({
		url: endpoints.remoteAction,
		method: 'post',
		body: formData,
	});

	return JSON.parse(response.body);
}

/**
 * 
 * @param {String} token the api token
 * @param {{vin: String, pin: string, email: string}} config the object config 
 * @returns {Promise<any>} something to return lol
 */
async function vehiclePanic(token, config) {

  const formData = buildFormData({
    vin: config.vin,
    username: config.email,
    token: token,
    pin: config.pin,
    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
    gen: 2,
    regId: config.vin,
		service: 'horn'
  });

  const response = await got({
		url: endpoints.remoteAction,
		method: 'post',
		body: formData,
	});

	return JSON.parse(response.body);
}

/**
 * 
 * @param {String} token the api token
 * @param {{vin: String, pin: string, email: string}} config the object config 
 * @returns {Promise<any>} something to return lol
 */
async function vehicleHealth(token, config) {

  const formData = buildFormData({
    vin: config.vin,
    username: config.email,
    token: token,
    url: 'https://owners.hyundaiusa.com/us/en/page/vehicle-health.html',
		service: 'getRecMaintenanceTimeline'
  });

  const response = await got({
		url: endpoints.health,
		method: 'post',
		body: formData,
	});

	return JSON.parse(response.body);
}

/** 
 * This endpoint seems to have features of the vehicle along with request counts
 * @param {String} token the api token
 * @param {{vin: String, pin: string, email: string}} config the object config 
 * @returns {Promise<any>} something to return lol
 */
async function apiUsageStatus(token, config) {

  const formData = buildFormData({
    vin: config.vin,
    username: config.email,
		token: token,
		startdate: 20140401,
		enddate: 20190611,
    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
		service: 'getUsageStats'
  });

  const response = await got({
		url: endpoints.usageStats,
		method: 'post',
		body: formData,
	});

	return JSON.parse(response.body);
}

module.exports = {
	getToken,
	flashVehicleLights,
	vehiclePanic,
	lockVehicle,
	unlockVehicle,
	startVehicle,
	stopVehicle,
	apiUsageStatus,
	vehicleHealth
}
