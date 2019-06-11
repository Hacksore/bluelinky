const got = require("got");
const FormData = require("form-data");

const endpoints = {
  getToken: "https://owners.hyundaiusa.com/etc/designs/ownercommon/us/token.json?reg=",
  validateToken: "https://owners.hyundaiusa.com/libs/granite/csrf/token.json",
  auth: "https://owners.hyundaiusa.com/bin/common/connectCar"
};

async function auth(config) {
  let response;

  const now = Math.floor(new Date() / 1000);
  response = await got({
    url: endpoints.getToken + now,
    method: "GET",
    json: true
  });

  const token = response.body.token;

  response = await got({
    url: endpoints.validateToken,
    method: "GET",
    headers: {
      'Cookie': 'csrf_token=' + token + ";"
    }
  });

  const form = new FormData();
  const data = {
    ':cq_csrf_token': token,
    'username': config.email,
    'password': config.password,
    'url': "https://owners.hyundaiusa.com/us/en/index.html"
  };

  for (const key in data) {
    form.append(key, data[key]);
  }

  try {
    response = await got({
      url: endpoints.auth,
      method: "POST",
      body: form
    });

    const json = JSON.parse(response.body);
    return json.Token.access_token;

  } catch (e) {
    console.log(e)
  }
}

async function lockVehicle(config) {
	// TODO: make this not happen everytime? caching?
	const token = await auth(config);
	const form = new FormData();

  const data = {
    vin: config.vin,
    username: config.email,
    token: token,
    pin: config.pin,
    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
    gen: 2,
    regId: config.vin,
		service: 'remotelock'
  };

  for (const key in data) {
    form.append(key, data[key]);
  }

  response = await got({
		url: 'https://owners.hyundaiusa.com/bin/common/remoteAction',
		method: 'post',
		body: form
	})
	.then(res => {
		console.log(res.body);
	})
	.catch(err => console.log(err));

	return response;
}

module.exports = {
	lockVehicle
}
