import * as winston from 'winston';

const defaultLevel = process.env.LOG_LEVEL || 'info';
const { colorize, combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const combinedFormats = combine(
  timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  colorize(),
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
