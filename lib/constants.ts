export const US_ENDPOINTS = {
  getToken: 'https://owners.hyundaiusa.com/etc/designs/ownercommon/us/token.json?reg=',
  validateToken: 'https://owners.hyundaiusa.com/libs/granite/csrf/token.json',
  auth: 'https://owners.hyundaiusa.com/bin/common/connectCar',
  remoteAction: 'https://owners.hyundaiusa.com/bin/common/remoteAction',
  usageStats: 'https://owners.hyundaiusa.com/bin/common/usagestats',
  health: 'https://owners.hyundaiusa.com/bin/common/VehicleHealthServlet',
  messageCenter: 'https://owners.hyundaiusa.com/bin/common/MessageCenterServlet',
  myAccount: 'https://owners.hyundaiusa.com/bin/common/MyAccountServlet',
  status: 'https://owners.hyundaiusa.com/bin/common/enrollmentFeature',
  enrollmentStatus: 'https://owners.hyundaiusa.com/bin/common/enrollmentStatus',
  subscriptions: 'https://owners.hyundaiusa.com/bin/common/managesubscription'
};

export const CA_ENDPOINTS = {
  login: 'https://mybluelink.ca/tods/api/lgn',
  logout: 'https://mybluelink.ca/tods/api/lgout',
  lock: 'https://mybluelink.ca/tods/api/drlck',
  list: 'https://mybluelink.ca/tods/api/vhcllst',
  status: 'https://mybluelink.ca/tods/api/lstvhclsts',
  verifyToken: 'https://mybluelink.ca/tods/api/vrfytnc',
  verifyPin: 'https://mybluelink.ca/tods/api/vrfypin',
};

export const ALL_ENDPOINTS =  {
  US: US_ENDPOINTS,
  CA: CA_ENDPOINTS,
};

export const GEN2 = 2;
export const GEN1 = 1;
