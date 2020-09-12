/* eslint-disable */
import got from 'got';

import AmericanVehicle from '../lib/vehicles/american.vehicle';
import { AmericanController } from '../lib/controllers/american.controller';

import EuropeanVehicle from '../lib/vehicles/european.vehicle';
import { EuropeanController } from '../lib/controllers/european.controller';

import CanadianVehicle from '../lib/vehicles/canadian.vehicle';
import { CanadianController } from '../lib/controllers/canadian.controller';

import AMERICAN_STATUS_MOCK from './mock/americanStatus.json';
import EUROPE_STATUS_MOCK from './mock/europeStatus.json';

jest.mock('got');

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

const getVehicle = region => {
  const Vehicle = referenceMap[region].vehicle;
  const Controller = referenceMap[region].controller;

  const controller = new Controller({
    username: 'testuser@gmail.com',
    password: 'test',
    region: 'US',
    autoLogin: true,
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

  it('call lock commmand', async () => {
    (got as any).mockReturnValueOnce({
      body: {},
      statusCode: 200,
    });

    const response = await vehicle.lock();
    expect(response).toEqual('Lock successful');
  });

  it('call status commmand', async () => {
    (got as any).mockReturnValueOnce({
      body: JSON.stringify({ vehicleStatus: AMERICAN_STATUS_MOCK }),
      statusCode: 200,
    });

    const response = await vehicle.status({ parsed: true });
    expect(response.engine.range).toEqual(AMERICAN_STATUS_MOCK.dte.value);
  });
});

describe('CanadianVehicle', () => {
  const vehicle = getVehicle('CA');

  it('define new vehicle', () => {
    expect(vehicle.nickname()).toEqual('Jest is best');
  });

  it('call lock commmand', async () => {
    (got as any).mockReturnValueOnce({
      body: {
        result: {
          pAuth: 'test',
        },
        responseHeader: {
          responseCode: 0,
        },
      },
      statusCode: 200,
    });

    (got as any).mockReturnValueOnce({
      body: {
        responseHeader: {
          responseCode: 0,
        },
      },
      statusCode: 200,
    });

    const response = await vehicle.lock();
    expect(response).toEqual('Lock successful');
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
    (got as any).mockReturnValueOnce({
      body: JSON.stringify({ access_token: 'AAAAAAAA', expires_in: 10 }),
      statusCode: 200,
    });

    (got as any).mockClear();

    const result = await vehicle.controller.refreshAccessToken();
    expect(result).toEqual('Token refreshed');
    // should update access token
    expect(vehicle.controller.session.accessToken).toEqual('Bearer AAAAAAAA');
    expect(vehicle.controller.session.tokenExpiresAt).toBeGreaterThan(Date.now() / 1000);
    expect(vehicle.controller.session.tokenExpiresAt).toBeLessThan(Date.now() / 1000 + 20);

    const gotArgs = (got as any).mock.calls[0];
    expect(gotArgs[0]).toMatch(/token$/);
    expect(gotArgs[1].body).toContain("grant_type=refresh_token");
    expect(gotArgs[1].body).toContain("refresh_token=" + vehicle.controller.session.refreshToken);
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

    (got as any).mockClear();

    const result = await vehicle.controller.refreshAccessToken();
    expect(result).toEqual('Token not expired, no need to refresh');
    // should not call got
    expect((got as any).mock.calls).toHaveLength(0);
  });

  it('refresh expired control token', async () => {
    // create session with active access token and expired control token
    vehicle.controller.session = {
      accessToken: 'Bearer eyASKLFABADFJ',
      refreshToken: 'KASDLNWE0JKH5KHK1K5JKH',
      controlToken: 'Bearer eyASWAWJPLZL',
      deviceId: 'aaaa-bbbb-cccc-eeee',
      tokenExpiresAt: Date.now() / 1000 + 20,
      controlTokenExpiresAt: Date.now() / 1000 - 10,
    };

    // mock pin request
    (got as any).mockReturnValueOnce({
      body: { controlToken: 'BBBBBB', expiresTime: 10 },
      statusCode: 200,
    });

    (got as any).mockClear();

    await vehicle.checkControlToken();
    // should update control token
    expect(vehicle.controller.session.controlToken).toEqual('Bearer BBBBBB');
    expect(vehicle.controller.session.controlTokenExpiresAt).toBeGreaterThan(Date.now() / 1000);
    expect(vehicle.controller.session.controlTokenExpiresAt).toBeLessThan(Date.now() / 1000 + 20);

    const gotArgs = (got as any).mock.calls[0];
    expect(gotArgs[0]).toMatch(/pin$/);
    expect(gotArgs[1].headers.Authorization).toEqual(vehicle.controller.session.accessToken);
    expect(gotArgs[1].body.deviceId).toEqual("aaaa-bbbb-cccc-eeee");
    expect(gotArgs[1].body.pin).toEqual("1234");
  });

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

    (got as any).mockClear();

    await vehicle.checkControlToken();
    // should not call got
    expect((got as any).mock.calls).toHaveLength(0);
  });

  it('call status commmand', async () => {
    // create session with active control and access token
    vehicle.controller.session = {
      accessToken: 'Bearer eyASKLFABADFJ',
      refreshToken: 'KASDLNWE0JKH5KHK1K5JKH',
      controlToken: 'Bearer eyASWAWJPLZL',
      deviceId: 'aaaa-bbbb-cccc-eeee',
      tokenExpiresAt: Date.now() / 1000 + 20,
      controlTokenExpiresAt: Date.now() / 1000 + 10,
    };

    // mock the status request
    (got as any).mockReturnValueOnce({
      body: EUROPE_STATUS_MOCK,
      statusCode: 200,
    });

    const response = await vehicle.status({ parsed: true });

    const expected =
      EUROPE_STATUS_MOCK.resMsg.vehicleStatusInfo.vehicleStatus.evStatus.drvDistance[0].rangeByFuel
        .totalAvailableRange.value;
    expect(response.engine.range).toEqual(expected);
  });
});
