import * as winston from 'winston';
import util from 'util';

const defaultLevel = process.env.LOG_LEVEL || 'info';
const { colorize, json, combine, timestamp, printf } = winston.format;

// TODO: get json working without haveing to use splat
const myFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
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
