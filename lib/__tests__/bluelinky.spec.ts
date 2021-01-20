/* eslint-disable */

import got from 'got';
import BlueLinky from '../index';
jest.mock('got');

const gotMock = got as any;

const VEHICLE_MOCK_DATA = {
  enrolledVehicleDetails: [
    {
      vehicleDetails: {
        nickname: 'JEST',
        vin: 'JEST_TESTING_1',
        regDate: 'JEST',
        brandIndicator: 'H',
        regId: 'H000000',
        gen: '2',
        name: 'JEST',
      },
    },
    {
      vehicleDetails: {
        nickname: 'JEST',
        vin: 'JEST_TESTING_2',
        regDate: 'JEST',
        brandIndicator: 'H',
        regId: 'H000000',
        gen: '2',
        name: 'JEST',
      },
    },
  ],
};

describe('BlueLinky', () => {
  it('calls error even when bad creds', done => {
    gotMock.mockReturnValueOnce({
      body: {
        error: {
          message: 'you did something wrong!',
        },
      },
      statusCode: 401,
    });

    const client = new BlueLinky({
      username: 'someone@gmai.com',
      password: '123',
      pin: '1234',
      region: 'US',
    });

    client.on('error', error => {
      done();
    });
  });
});

describe('BlueLinky', () => {
  beforeEach(() => {
    (got as any)
      .mockReturnValueOnce({
        body: {
          access_token: 'test',
          refresh_token: 'test',
          expires_in: 'test',
        },
        statusCode: 200,
      })
      .mockReturnValueOnce({
        body: JSON.stringify(VEHICLE_MOCK_DATA),
        statusCode: 200,
      });
  });

  it('creates a client with valid config', () => {
    const client = new BlueLinky({
      username: 'someone@gmail.com',
      password: 'hunter1',
      pin: '1234',
      region: 'US',
    });

    expect(client).toBeDefined();

    client.on('ready', () => {
      expect(client.getSession()).toBeDefined();
      expect(client.getSession().accessToken).toEqual('test');
    });
  });

  it('throws error when you pass invalid region', () => {
    expect(() => {
      const client = new BlueLinky({
        username: 'someone@gmail.com',
        password: 'hunter1',
        pin: '1234',
        region: 'KR',
      });
    }).toThrowError('Your region is not supported yet.');
  });

  it('ready event is called after login', done => {
    const client = new BlueLinky({
      username: 'someone@gmail.com',
      password: 'hunter1',
      pin: '1234',
      region: 'US',
    });

    client.on('ready', () => {
      done();
    });
  });

  it('getVehicle throws error on bad input', done => {
    const client = new BlueLinky({
      username: 'someone@gmail.com',
      password: 'hunter1',
      pin: '1234',
      region: 'US',
    });

    client.on('ready', () => {
      expect(() => client.getVehicle('test')).toThrowError();
      done();
    });
  });

  it('getVehicle returns correct vehicle', done => {
    const client = new BlueLinky({
      username: 'someone@gmai.com',
      password: 'hunter1',
      pin: '1234',
      region: 'US',
    });

    client.on('ready', vehicles => {
      const veh1 = client.getVehicle('JEST_TESTING_1');
      const veh2 = client.getVehicle('JEST_TESTING_2');

      expect(veh1.vin()).toEqual('JEST_TESTING_1');
      expect(veh2.vin()).toEqual('JEST_TESTING_2');

      done();
    });
  });
});
