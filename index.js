const got = require("got");
const FormData = require("form-data");
const form = new FormData();

require('dotenv').config();

const config = {
	email: process.env.EMAIL,
	password: process.env.PASSWORD,
	vin: process.env.VIN,
	pin: process.env.PIN
}

const endpoints = {
  getToken: "https://owners.hyundaiusa.com/etc/designs/ownercommon/us/token.json?reg=",
  validateToken: "https://owners.hyundaiusa.com/libs/granite/csrf/token.json",
  auth: "https://owners.hyundaiusa.com/bin/common/connectCar"
};

async function auth() {
  let response;

  const now = Math.floor(new Date() / 1000);
  response = await got({
    url: endpoints.getToken + now,
    method: "GET",
    json: true,
    headers: {
      'Host': "owners.hyundaiusa.com",
      'Referer': "https://owners.hyundaiusa.com/us/en/index.html",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
    }
  });

  const token = response.body.token;

  response = await got({
    url: endpoints.validateToken,
    method: "GET",
    headers: {
      'Cookie': 'csrf_token=' + token + ";",
      'Host': "owners.hyundaiusa.com",
      'Referer': "https://owners.hyundaiusa.com/us/en/index.html",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
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
      headers: {
        'Host': "owners.hyundaiusa.com",
        'Referer': "https://owners.hyundaiusa.com/us/en/index.html",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
      },
      method: "POST",
      body: form
    });

    const json = JSON.parse(response.body);
    return json.Token.access_token;

  } catch (e) {
    console.log(e)
  }

}

async function lock() {
  const token = await auth();

  const data = {
    vin: config.vin,
    username: config.email,
    token: token,
    pin: config.pin,
    url: "https://owners.hyundaiusa.com/us/en/page/dashboard.html",
    gen: 2,
    regId: "H00002548087V" + config.vin,
    service: "remotelock"
  };

  for (const key in data) {
    form.append(key, data[key]);
  }

  got
    .post({
      url: "https://owners.hyundaiusa.com/bin/common/remoteAction",
      body: form
    })
    .then(res => {
      console.log(res.body);
    })
    .catch(err => console.log(err));
}

// first test of a command
lock();
