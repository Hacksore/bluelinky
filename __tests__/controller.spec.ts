/* eslint-disable */
import got from 'got';

import { AmericanController } from '../src/controllers/american.controller';
import { EuropeanController } from '../src/controllers/european.controller';
import { CanadianController } from '../src/controllers/canadian.controller';

jest.mock('got');

const getController = region => {
  const referenceMap = {
    US: AmericanController,
    EU: EuropeanController,
    CA: CanadianController,
  };

  const controller = new referenceMap[region]({
    username: 'testuser@gmail.com',
    password: 'test',
    region: 'US',
    brand: 'hyundai',
    autoLogin: true,
    pin: '1234',
    vin: '4444444444444',
    vehicleId: undefined,
  });

  return controller;
};

describe('AmericanController', () => {
  const controller = getController('US');

  it('call login and get valid response', async () => {
    (got as any).mockReturnValueOnce({
      body: {
        access_token: 'jest',
        refresh_token: 'test',
      },
      statusCode: 200,
    });

    expect(await controller.login()).toEqual('login good');
  });

  it('call getVehicles and check length', async () => {
    (got as any).mockReturnValueOnce({
      body: JSON.stringify({
        enrolledVehicleDetails: [
          {
            vehicleDetails: [
              {
                nickname: 'Jest is best',
                vin: '444',
                regDate: 'test',
                brandIndicator: 'H',
                regId: '123123',
                gen: '2',
                name: 'Car',
              },
            ],
          },
        ],
      }),
      statusCode: 200,
    });

    expect(await controller.getVehicles()).toHaveLength(1);
  });
});

describe('EuropeanController', () => {
  it('call getVehicles and check length', async () => {
    const controller = getController('EU');
    controller.session.accessToken = 'MockToken';

    (got as any).mockReturnValueOnce({
      body: {
        resMsg: {
          vehicles: [
            {
              nickname: 'Jest is best',
              vin: '444',
              regDate: 'test',
              brandIndicator: 'H',
              regId: '123123',
              gen: '2',
              name: 'Car',
              id: '12345',
            },
          ],
        },
      },
      statusCode: 200,
    });

    (got as any).mockReturnValueOnce({
      body: {
        resMsg: {
          vinInfo: [
            {
              basic: {
                modelYear: '2019',
                vin: '5555',
                id: '123456',
              },
            },
          ],
        },
      },
      statusCode: 200,
    });

    const vehicles = await controller.getVehicles();
    expect(vehicles).toHaveLength(1);
  });
});

describe('CanadianController', () => {
  it('call getVehicles and check length', async () => {
    const controller = getController('CA');

    (got as any).mockReturnValueOnce({
      body: {
        responseHeader: {
          responseCode: 0,
        },
        result: {
          vehicles: [
            {
              nickname: 'Jest is best',
              vin: '444',
              regDate: 'test',
              brandIndicator: 'H',
              regId: '123123',
              gen: '2',
              name: 'Car',
            },
          ],
        },
      },
      statusCode: 200,
    });

    expect(await controller.getVehicles()).toHaveLength(1);
  });
});
