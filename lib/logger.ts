import * as winston from 'winston';
import util from 'util';

const defaultLevel = process.env.LOG_LEVEL || 'info';
const { colorize, json, combine, timestamp, printf } = winston.format;

// TODO: get json working for printing
const myFormat = printf(({ info, level, message, timestamp, ...leftOver }) => {
  const prefix = `[${timestamp}] ${level}:`;
  let retVal;
  if(message) {
    retVal += prefix + message;
  } else{
    retVal += prefix + util.inspect(JSON.parse(message));
  }

  return retVal;
});

const combinedFormats = combine(
  timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  colorize(),
  json(),
  myFormat,
);

const logger: winston.Logger = winston.createLogger({
  format: combinedFormats,
  level: defaultLevel,
  transports: [
    new winston.transports.Console({ }),
  ],
});

export default logger;
