import stamps from './european.kia.token.collection';

export const getStamp = (): string => {
  return stamps[Math.floor(Math.random() * stamps.length)];
};
