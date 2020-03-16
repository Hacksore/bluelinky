
/* eslint-disable */ 

import got from 'got';
import BlueLinky from '../lib/index';
jest.mock('got');

describe('BlueLinky', () => {
  
  beforeEach(() => {
    got.mockReturnValueOnce({ 
      body: {
        'access_token': 'test',
        'refresh_token': 'test',
        'expires_in': 'test'
      },
      statusCode: 200
    })
    .mockReturnValueOnce({ 
      body: '[]',
      statusCode: 200
    });
  });

  it('Creates a client with valid config', () => {
    const client = new BlueLinky({
      username: 'someone@gmail.com',
      password: 'hunter1',
      pin: '1234',
      region: 'US'
    });
    
    expect(client).toBeDefined();
  });

  it('Throws error when you pass invalid region', () => {
    expect(() => {
      const client = new BlueLinky({
        username: 'someone@gmail.com',
        password: 'hunter1',
        pin: '1234',
        region: 'KR'
      })    
    }).toThrowError('Your region is not supported yet.');
  });

  it('ready method is called after login', (done) => {
    const client = new BlueLinky({
      username: 'someone@gmai.com',
      password: 'hunter1',
      pin: '1234',
      region: 'US'
    });

    client.on('ready', () => {
      done();
    });

  });

});
