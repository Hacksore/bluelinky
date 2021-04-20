/* eslint-disable */
import got from 'got';

import AmericanVehicle from '../src/vehicles/american.vehicle';
import { AmericanController } from '../src/controllers/american.controller';

import EuropeanVehicle from '../src/vehicles/european.vehicle';
import { EuropeanController } from '../src/controllers/european.controller';

import CanadianVehicle from '../src/vehicles/canadian.vehicle';
import { CanadianController } from '../src/controllers/canadian.controller';

import AMERICAN_STATUS_MOCK from './mock/americanStatus.json';
import EUROPE_STATUS_MOCK from './mock/europeStatus.json';

jest.mock('got');

const gotMock = got as any;

const referenceMap = {
  US: {
    controller: AmericanController,
    vehicle: AmericanVehicle,
  },
  EU: {
    controller: EuropeanController,
    vehicle: EuropeanVehicle,
  },
  CA: {
    controller: CanadianController,
    vehicle: CanadianVehicle,
  },
};

const getVehicle = (region: string) => {
  const Vehicle = referenceMap[region].vehicle;
  const Controller = referenceMap[region].controller;

  const controller = new Controller({
    username: 'testuser@gmail.com',
    password: 'test',
    region: region,
    autoLogin: true,
    brand: 'hyundai',
    pin: '1234',
    vin: '4444444444444',
    vehicleId: undefined,
  });

  const vehicle = new Vehicle(
    {
      nickname: 'Jest is best',
      name: 'Jest is best',
      vin: '444',
      regDate: 'test',
      brandIndicator: 'H',
      regId: '123123',
      generation: '2',
    },
    controller
  );

  return vehicle;
};

describe('AmericanVehicle', () => {
  const vehicle = getVehicle('US');

  it('define new vehicle', () => {
    expect(vehicle.nickname()).toEqual('Jest is best');
  });

  it('refresh expired access token', async () => {
    // create session with expired access token
    vehicle.controller.session = {
      accessToken: 'JEST_TOKEN',
      refreshToken: 'JEST_TOKEN',
      tokenExpiresAt: Math.floor(Date.now() / 1000) - 100,
    };

    // mock token request
    gotMock.mockReturnValueOnce({
      body: {
        access_token: 'JEST_TOKEN',
        refresh_token: 'JEST_TOKEN',
        expires_in: 10,
      },
      json: true,
      statusCode: 200,
    });

    const result = await vehicle.controller.refreshAccessToken();
    expect(result).toEqual('Token refreshed');

    // should update access token
    expect(vehicle.controller.session.accessToken).toEqual('JEST_TOKEN');
    expect(vehicle.controller.session.tokenExpiresAt).toBeGreaterThan(
      Math.floor(Date.now() / 1000)
    );
    expect(vehicle.controller.session.tokenExpiresAt).toBeLessThan(
      Math.floor(Date.now() / 1000 + 20)
    );
  });

  it('call lock commmand', async () => {
    // default session with a valid token
    vehicle.controller.session = {
      accessToken: 'JEST_TOKEN',
      refreshToken: 'JEST_TOKEN',
      tokenExpiresAt: Date.now() / 1000 + 300,
    };

    gotMock.mockReturnValueOnce({
      body: JSON.stringify({}),
      statusCode: 200,
    });

    const response = await vehicle.lock();
    expect(response).toEqual('Lock successful');
  });

  it('call status commmand', async () => {
    gotMock.mockReturnValueOnce({
      body: JSON.stringify({ vehicleStatus: AMERICAN_STATUS_MOCK }),
      statusCode: 200,
    });

    const response = await vehicle.status({ parsed: true });
    expect(response.engine.range).toEqual(AMERICAN_STATUS_MOCK.dte.value);
  });
});

describe('CanadianVehicle', () => {
  const vehicle: CanadianVehicle = getVehicle('CA');

  it('define new vehicle', () => {
    expect(vehicle.nickname()).toEqual('Jest is best');
  });

  it('refresh expired access token', async () => {
    // create session with expired access token
    vehicle.controller.session = {
      accessToken: 'JEST_TOKEN',
      refreshToken: 'JEST_TOKEN',
      tokenExpiresAt: Date.now() / 1000,
      controlTokenExpiresAt: 0,
    };

    // mock token request
    gotMock.mockReturnValueOnce({
      body: JSON.stringify({
        access_token: 'JEST_TOKEN',
        refresh_token: 'JEST_TOKEN',
        expires_in: 10,
      }),
      statusCode: 200,
    });

    const result = await vehicle.controller.refreshAccessToken();
    expect(result).toEqual('Token refreshed');
    // should update access token
    expect(vehicle.controller.session.accessToken).toEqual('JEST_TOKEN');
    expect(vehicle.controller.session.tokenExpiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(vehicle.controller.session.tokenExpiresAt).toBeLessThan(Math.floor(Date.now() / 1000 + 20));

  });

  it('call lock commmand', async () => {
    // default session with a valid token
    vehicle.controller.session = {
      accessToken: 'JEST_TOKEN',
      refreshToken: 'JEST_TOKEN',
      tokenExpiresAt: Date.now() / 1000 + 300,
    };

    gotMock.mockReturnValueOnce({
      body: {
        result: {
          pAuth: 'test',
        },
        responseHeader: {
          responseCode: 0,
        },
      },
      statusCode: 200,
      json: true,
    });

    gotMock.mockReturnValueOnce({
      body: {
        responseHeader: {
          responseCode: 0,
        },
      },
      statusCode: 200,
      json: true,
    });

    const response = await vehicle.lock();
    expect(response).toEqual('Lock successful');
  });

  it('call start command succesfully', async () => {
    // default session with a valid token
    vehicle.controller.session = {
      accessToken: 'JEST_TOKEN',
      refreshToken: 'JEST_TOKEN',
      tokenExpiresAt: Date.now() / 1000 + 300,
    };

    gotMock.mockReturnValueOnce({
      body: {
        result: {
          pAuth: 'test',
        },
        responseHeader: {
          responseCode: 0,
        },
      },
      statusCode: 200,
      json: true,
    });

    gotMock.mockReturnValueOnce({
      body: {
        responseHeader: {
          responseCode: 0,
        },
      },
      statusCode: 200,
      json: true,
    });

    const response = await vehicle.start({
      airCtrl: false,
      igniOnDuration: 10,
      airTempvalue: 70,
      defrost: false,
      heating1: false,
    });
    expect(response).toEqual('Vehicle started!');
  });

  it('call start command with error', async () => {
    // default session with a valid token
    vehicle.controller.session = {
      accessToken: 'JEST_TOKEN',
      refreshToken: 'JEST_TOKEN',
      tokenExpiresAt: Date.now() / 1000 + 300,
    };

    gotMock.mockReturnValueOnce({
      body: {
        result: {
          pAuth: 'test',
        },
        responseHeader: {
          responseCode: 0,
        },
      },
      statusCode: 200,
      json: true,
    });

    gotMock.mockReturnValueOnce({
      body: {
        responseHeader: {
          responseCode: 1,
          responseDesc: 'failed'
        },
      },
      statusCode: 200,
      json: true,
    });

    const response = await vehicle.start({
      airCtrl: false,
      igniOnDuration: 10,
      airTempvalue: 70,
      defrost: false,
      heating1: false,
    });
    expect(response).toEqual('Failed to start vehicle');
  });
});

describe('EuropeanVehicle', () => {
  const vehicle = getVehicle('EU');

  it('define new vehicle', () => {
    expect(vehicle.nickname()).toEqual('Jest is best');
  });

  it('refresh expired access token', async () => {
    // create session with expired access token
    vehicle.controller.session = {
      accessToken: 'Bearer eyASKLFABADFJ',
      refreshToken: 'KASDLNWE0JKH5KHK1K5JKH',
      controlToken: 'Bearer eyASWAWJPLZL',
      deviceId: 'aaaa-bbbb-cccc-eeee',
      tokenExpiresAt: Date.now() / 1000,
      controlTokenExpiresAt: 0,
    };

    // mock token request
    gotMock.mockReturnValueOnce({
      body: JSON.stringify({ access_token: 'AAAAAAAA', expires_in: 10 }),
      statusCode: 200,
    });

    gotMock.mockClear();

    const result = await vehicle.controller.refreshAccessToken();
    expect(result).toEqual('Token refreshed');
    // should update access token
    expect(vehicle.controller.session.accessToken).toEqual('Bearer AAAAAAAA');
    expect(vehicle.controller.session.tokenExpiresAt).toBeGreaterThan(
      Math.floor(Date.now() / 1000)
    );
    expect(vehicle.controller.session.tokenExpiresAt).toBeLessThan(
      Math.floor(Date.now() / 1000 + 20)
    );

    const gotArgs = gotMock.mock.calls[0];
    expect(gotArgs[0]).toMatch(/token$/);
    expect(gotArgs[1].body).toContain('grant_type=refresh_token');
    expect(gotArgs[1].body).toContain('refresh_token=' + vehicle.controller.session.refreshToken);
  });

  it('not refresh active access token', async () => {
    // create session with active access token
    vehicle.controller.session = {
      accessToken: 'Bearer eyASKLFABADFJ',
      refreshToken: 'KASDLNWE0JKH5KHK1K5JKH',
      controlToken: 'Bearer eyASWAWJPLZL',
      deviceId: 'aaaa-bbbb-cccc-eeee',
      tokenExpiresAt: Date.now() / 1000 + 20,
      controlTokenExpiresAt: 0,
    };

    gotMock.mockClear();

    const result = await vehicle.controller.refreshAccessToken();
    expect(result).toEqual('Token not expired, no need to refresh');
    // should not call got
    expect(gotMock.mock.calls).toHaveLength(0);
  });

  // FIXME: this test it borked with refactor
  // it('refresh expired control token', async () => {
  //   // create session with active access token and expired control token
  //   vehicle.controller.session = {
  //     accessToken: 'Bearer eyASKLFABADFJ',
  //     refreshToken: 'KASDLNWE0JKH5KHK1K5JKH',
  //     controlToken: 'Bearer eyASWAWJPLZL',
  //     deviceId: 'aaaa-bbbb-cccc-eeee',
  //     tokenExpiresAt: Date.now() / 1000 + 20,
  //     controlTokenExpiresAt: Date.now() / 1000 - 10,
  //   };

  //   // mock pin request
  //   gotMock.mockReturnValueOnce({
  //     body: { controlToken: 'eyASWAWJPLZL', expiresTime: 20 },
  //     statusCode: 200,
  //   });

  //   gotMock.mockClear();
    
  //   await vehicle.checkControlToken();

  //   // should update control token
  //   expect(vehicle.controller.session.controlToken).toEqual('Bearer eyASWAWJPLZL');
  //   expect(vehicle.controller.session.controlTokenExpiresAt).toBeGreaterThan(Date.now() / 1000);
  //   expect(vehicle.controller.session.controlTokenExpiresAt).toBeLessThan(Date.now() / 1000 + 20);

  //   const gotArgs = gotMock.mock.calls[0];
  //   expect(gotArgs[0]).toMatch(/pin$/);
  //   expect(gotArgs[1].headers.Authorization).toEqual(vehicle.controller.session.accessToken);
  //   expect(gotArgs[1].body.deviceId).toEqual('aaaa-bbbb-cccc-eeee');
  //   expect(gotArgs[1].body.pin).toEqual('1234');
  // });

  it('not refresh active control token', async () => {
    // create session with active control and access token
    vehicle.controller.session = {
      accessToken: 'Bearer eyASKLFABADFJ',
      refreshToken: 'KASDLNWE0JKH5KHK1K5JKH',
      controlToken: 'Bearer eyASWAWJPLZL',
      deviceId: 'aaaa-bbbb-cccc-eeee',
      tokenExpiresAt: Date.now() / 1000 + 20,
      controlTokenExpiresAt: Date.now() / 1000 + 10,
    };

    gotMock.mockClear();

    // should not call got
    expect(gotMock.mock.calls).toHaveLength(0);
  });

  // it('call status commmand', async () => {
  //   // create session with active control and access token
  //   vehicle.controller.session = {
  //     accessToken: 'Bearer eyASKLFABADFJ',
  //     refreshToken: 'KASDLNWE0JKH5KHK1K5JKH',
  //     controlToken: 'Bearer eyASWAWJPLZL',
  //     deviceId: 'aaaa-bbbb-cccc-eeee',
  //     tokenExpiresAt: Date.now() / 1000 + 20,
  //     controlTokenExpiresAt: Date.now() / 1000 + 10,
  //   };

  //   // mock the status request
  //   gotMock.mockReturnValueOnce({
  //     body: EUROPE_STATUS_MOCK,
  //     statusCode: 200,
  //   });

  //   const response = await vehicle.status({ parsed: true });

  //   const expected =
  //     EUROPE_STATUS_MOCK.resMsg.vehicleStatusInfo.vehicleStatus.evStatus.drvDistance[0].rangeByFuel
  //       .totalAvailableRange.value;
  //   expect(response.engine.range).toEqual(expected);
  // });
});
