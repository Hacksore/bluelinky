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
  // Account
  myAccount: 'https://mybluelink.ca/tods/api/acctinfo',
  nextService: 'https://mybluelink.ca/tods/api/nxtsvc',
  preferedDealer : 'https://mybluelink.ca/tods/api/gtprfrdlr',
  // Vehicle
  vehicleList: 'https://mybluelink.ca/tods/api/vhcllst',
  vehicleInfo: "https://mybluelink.ca/tods/api/sltvhcl",
  status: 'https://mybluelink.ca/tods/api/lstvhclsts',
  remoteStatus: 'https://mybluelink.ca/tods/api/rltmvhclsts',
  // Car commands with preauth (PIN)
  lock: 'https://mybluelink.ca/tods/api/drlck',
  unlock: 'https://mybluelink.ca/tods/api/drulck',
  start: 'https://mybluelink.ca/tods/api/evc/rfon',
  stop: 'https://mybluelink.ca/tods/api/evc/rfoff',
  locate: 'https://mybluelink.ca/tods/api/fndmcr',
  hornlight: "https://mybluelink.ca/tods/api/hornlight",
  // System
  verifyAccountToken: "https://mybluelink.ca/tods/api/vrfyacctkn",
  verifyPin: 'https://mybluelink.ca/tods/api/vrfypin',
  verifyToken: 'https://mybluelink.ca/tods/api/vrfytnc',
};

export const ALL_ENDPOINTS =  {
  US: US_ENDPOINTS,
  CA: CA_ENDPOINTS,
};

export const GEN2 = 2;
export const GEN1 = 1;
