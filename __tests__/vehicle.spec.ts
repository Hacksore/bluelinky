/* eslint-disable */
import got from 'got';

import AmericanVehicle from '../lib/vehicles/american.vehicle';
import { AmericanController } from '../lib/controllers/american.controller';

import EuropeanVehicle from '../lib/vehicles/european.vehicle';
import { EuropeanController } from '../lib/controllers/european.controller';

import CanadianVehicle from '../lib/vehicles/canadian.vehicle';
import { CanadianController } from '../lib/controllers/canadian.controller';

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

  // TODO: EU lead gets to write these :)
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
