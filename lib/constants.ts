export const endpoints = {
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

export const GEN2 = 2;
export const GEN1 = 1;
