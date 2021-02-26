import stamps from './european.token.collection';

export const getStamp = (): string => {
  return stamps[Math.floor(Math.random() * stamps.length)];
}