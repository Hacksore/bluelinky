/* eslint-disable */
import got from 'got';

import AmericanVehicle from '../lib/vehicles/americanVehicle';
import { AmericanController } from '../lib/controllers/american.controller';

import EuropeanVehicle from '../lib/vehicles/europianVehicle';
import { EuropeanController } from '../lib/controllers/european.controller';

import CanadianVehicle from '../lib/vehicles/canadianVehicle';
import { CanadianController } from '../lib/controllers/canadian.controller';

jest.mock('got');

const getVehicle = region => {
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

  const controller = new referenceMap[region].controller({
    username: 'testuser@gmail.com',
    password: 'test',
    region: 'US',
    autoLogin: true,
    pin: '1234',
    vin: '4444444444444',
    vehicleId: undefined
  });

  const vehicle = new referenceMap[region].vehicle(
    {
      nickname: 'Jest is best',
      vin: '444',
      regDate: 'test',
      brandIndicator: 'H',
      regId: '123123',
      gen: '2',
      name: 'Car',
    },
    controller
  );

  return vehicle;
};

describe('AmericanVehicle', () => {
  const vehicle = getVehicle('US');

  it('define new vehicle', () => {
    expect(vehicle.config.nickname).toEqual('Jest is best');
  });

  it('call lock commmand', async () => {
    (got as any).mockReturnValueOnce({
      body: {},
      statusCode: 200,
    });

    const response = await vehicle.lock();
    expect(response).toEqual('Lock successful');

  });
});

describe('CanadianVehicle', () => {
  const vehicle = getVehicle('CA');

  it('define new vehicle', () => {
    expect(vehicle.config.nickname).toEqual('Jest is best');
  });

  it('call lock commmand', async () => {
    (got as any).mockReturnValueOnce({
      body: {
        result: {
          pAuth: 'test'
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
    expect(vehicle.config.nickname).toEqual('Jest is best');
  });

  // it('call lock commmand', async () => {
  //   (got as any).mockReturnValueOnce({
  //     body: {},
  //     statusCode: 200
  //   });

  //   const response = await vehicle.lock();
  //   expect(response).toEqual('Lock successful');
  // });

  // it('call unlock commmand', async () => {
  //   (got as any).mockReturnValueOnce({
  //     body: {},
  //     statusCode: 200
  //   });

  //   const response = await vehicle.unlock();
  //   expect(response).toEqual('Unlock successful');
  // });
});
