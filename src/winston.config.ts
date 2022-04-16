const winston = require("winston");
require("winston-daily-rotate-file");

const httpFilter = winston.format((info, opts) => {
  return info.level.toUpperCase() === "HTTP" ? info : false;
});

const options = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    http: 5,
    silly: 6,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
  dailyFile: {
    level: "debug",
    filename: "logs/application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    handleExceptions: true,
    maxSize: "20m",
  },
  dailyReqFile: {
    level: "http",
    levelOnly: true,
    filename: "logs/access-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    handleExceptions: true,
    maxSize: "20m",
    format: winston.format.combine(
      httpFilter(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(info => `${info.timestamp}: ${info.message}`),
    ),
  },
};

export const loggerOpts = {
  name: "app-logger",
  levels: options.levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      info => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  ),
  transports: [
    new winston.transports.Console(options.console),
    new winston.transports.DailyRotateFile(options.dailyReqFile),
    new winston.transports.DailyRotateFile(options.dailyFile),
  ],
  exitOnError: false, // do not exit on handled exceptions
};
