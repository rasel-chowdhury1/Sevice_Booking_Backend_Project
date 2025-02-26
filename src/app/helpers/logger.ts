import { createLogger, format, transports, Logger } from "winston";

const { combine, timestamp, json, colorize, printf } = format;

// Custom format for console logging with colors
const consoleLogFormat = combine(
  colorize(),
  timestamp(),
  printf(({ level, message, timestamp, method, url, responseTime }) => {
    return `${timestamp} ${level}: ${method ? `[${method}] ` : ""}${message} ${
      url ? `- ${url}` : ""
    } ${responseTime ? `Response Time: ${responseTime}ms` : ""}`;
  })
);

// Create a Winston logger
const logger: Logger = createLogger({
  level: "info",
  format: combine(timestamp(), json()), // JSON format for structured logging
  transports: [
    new transports.Console({
      format: consoleLogFormat, // Colorized format for the console
      level: "info", // Show all levels in the console
    }),
    new transports.File({
      filename: "app.log",
      level: "error", // Only store 'error' and higher levels in the file
      format: combine(timestamp(), json()), // JSON format for easier parsing in logs
    }),
    new transports.File({
      filename: "ResponseTime.log",
      level: "info", // Log response times as info level
      format: combine(timestamp(), json()), // JSON format for response time logs
    }),
  ],
});

export default logger;
