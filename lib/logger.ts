import * as winston from 'winston';

const defaultLevel = process.env.LOG_LEVEL || 'info';
const { colorize, json, combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {

  // convert objects into strings
  if (['array', 'object'].includes(typeof message)) {
    message = JSON.stringify(message, null, 2);
  }
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
