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
  list: 'https://mybluelink.ca/tods/api/vhcllst',
  lock: 'https://mybluelink.ca/tods/api/drlck',
  unlock: 'https://mybluelink.ca/tods/api/drulck',
  start: 'https://mybluelink.ca/tods/api/evc/rfon',
  stop: 'https://mybluelink.ca/tods/api/evc/rfoff',
  locate: 'https://mybluelink.ca/tods/api/fndmcr',
  myAccount: 'https://mybluelink.ca/tods/api/acctinfo',
  status: 'https://mybluelink.ca/tods/api/lstvhclsts',
  remoteStatus: 'https://mybluelink.ca/tods/api/rltmvhclsts',
  verifyPin: 'https://mybluelink.ca/tods/api/vrfypin',
  verifyToken: 'https://mybluelink.ca/tods/api/vrfytnc',
  vehicleInfo: 'https://mybluelink.ca/tods/api/sltvhcl',
  nextService: 'https://mybluelink.ca/tods/api/nxtsvc',
  preferedDealer : 'https://mybluelink.ca/tods/api/gtprfrdlr'
};

export const ALL_ENDPOINTS =  {
  US: US_ENDPOINTS,
  CA: CA_ENDPOINTS,
};

export const GEN2 = 2;
export const GEN1 = 1;
