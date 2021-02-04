// Kia seems to use myuvo.ca as mentioned by @wcomartin
// forks can modify some things to make this work
export const CA_API_HOST = 'mybluelink.ca';
export const CA_BASE_URL = `https://${CA_API_HOST}`;
export const CLIENT_ORIGIN = 'SPA';

export const CA_ENDPOINTS = {
  login: `${CA_BASE_URL}/tods/api/lgn`,
  logout: `${CA_BASE_URL}/tods/api/lgout`,
  // Vehicle
  vehicleList: `${CA_BASE_URL}/tods/api/vhcllst`,
  vehicleInfo: `${CA_BASE_URL}/tods/api/sltvhcl`,
  status: `${CA_BASE_URL}/tods/api/lstvhclsts`,
  remoteStatus: `${CA_BASE_URL}/tods/api/rltmvhclsts`,
  // Car commands with preauth (PIN)
  lock: `${CA_BASE_URL}/tods/api/drlck`,
  unlock: `${CA_BASE_URL}/tods/api/drulck`,
  start: `${CA_BASE_URL}/tods/api/evc/rfon`,
  stop: `${CA_BASE_URL}/tods/api/evc/rfoff`,
  locate: `${CA_BASE_URL}/tods/api/fndmcr`,
  hornlight: `${CA_BASE_URL}/tods/api/hornlight`,
  // System
  verifyAccountToken: `${CA_BASE_URL}/tods/api/vrfyacctkn`,
  verifyPin: `${CA_BASE_URL}/tods/api/vrfypin`,
  verifyToken: `${CA_BASE_URL}/tods/api/vrfytnc`,
};
