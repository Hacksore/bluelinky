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
  coord: {
    lat: number;
    alt: number;
    lon: number;
    type: 0;
  },
  addr: string;
  zip: string;
  placeid: string;
  name: string;
}
