import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import express, { Request, Response, NextFunction } from "express";

import {
  blue,
  green,
  greenBright,
  magenta,
  red,
  yellow,
  yellowBright,
} from "colorette";

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join("logs", "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
    }),
    new DailyRotateFile({
      filename: path.join("logs", "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
    }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

// Middleware to log requests and responses with emojis and extra information
export const logHttpRequests = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const colorizeByStatusCode = (statusCode: number) => {
      if (statusCode >= 200 && statusCode < 300) {
        return green(`${statusCode} 🎉`); // Successful responses
      } else if (statusCode >= 400 && statusCode < 500) {
        return red(`${statusCode} ⚠️`); // Client errors
      } else if (statusCode >= 500) {
        return yellow(`${statusCode} 🔥`); // Server errors
      }
      return blue(`${statusCode} ❗`); // Default color
    };
    const colorizeByMethod = (method: string) => {
      if (method === "GET") {
        return green(method + " 🔍"); // GET requests (read)
      } else if (method === "POST") {
        return blue(method + " ✏️"); // POST requests (create)
      } else if (method === "PATCH") {
        return yellow(method + " ✨"); // PATCH requests (update)
      } else if (method === "PUT") {
        return yellowBright(method + " 🛠️"); // PUT requests (replace)
      }
      return red(method + " " + "some error 😢☹️"); // Default for unknown methods
    };

    // Log the request information with method, status, and response time in ms
    // logger.info({
    //   message: ` 🌐 Incoming Request: ${colorizeByMethod(req.method)} ${colorizeByStatusCode(res.statusCode)} ${magenta(req.originalUrl)} ⏱️ Response Time: ${yellowBright(`${Date.now() - startTime} ms`)}`,
    //   size: res.get("Content-Length") || 0,
    //   // additionalInfo: `🖥️ IP: ${req.ip} | Host: ${req.hostname} | User-Agent: ${req.get("User-Agent")}`,
    // });

    const clientIp = req.ip
      ? req.ip.startsWith("::ffff:")
        ? req.ip.substring(7)
        : req.ip
      : "Unknown IP";

    logger.info({
      message: `🖥️ IP: ${clientIp} 📅: ${new Date().toLocaleDateString("en-US", { weekday: "long" })} 🌐 Incoming Request: ${colorizeByMethod(req.method)} ${colorizeByStatusCode(res.statusCode)} ${magenta(req.originalUrl)} ⏱️ Response Time: ${yellowBright(`${Date.now() - startTime} ms`)}`,
      size: res.get("Content-Length") || 0,
    });
  });

  next();
};

// 23.75481667639515, 90.41544649380958

// 23.754536267441427, 90.41531775186601