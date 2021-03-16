import stamps from './european.hyundai.token.collection';

export const getStamp = (): string => {
  return stamps[Math.floor(Math.random() * stamps.length)];
};
