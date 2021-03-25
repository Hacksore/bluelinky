export interface EuropeanEndpoints {
  session: string;
  login: string;
  redirect_uri: string;
  token: string;
}

export interface EUPOIInformation {
  phone: string;
  waypointID: number;
  lang: 1;
  src: 'HERE';
  coords: {
    lat: number;
    alt: number;
    long: number;
    type: 0;
  },
  addr: string;
  zip: string;
  placeid: string;
  name: string;
}
