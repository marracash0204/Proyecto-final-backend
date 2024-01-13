import winston from "winston";
import config from "../../config/config.js";

const niveles = {
  debug: 0,
  http: 1,
  info: 2,
  warning: 3,
  error: 4,
  fatal: 5,
};

const colores = {
  debug: "blue",
  http: "green",
  info: "cyan",
  warning: "yellow",
  error: "red",
  fatal: "magenta",
};

winston.addColors(colores);

const esDesarrollo = config.nodeEnv !== "production";

console.log("Entorno de desarrollo:", esDesarrollo);

const logger = winston.createLogger({
  levels: niveles,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      level: esDesarrollo ? "debug" : "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "errors.log",
      level: "error",
    }),
  ],
});

export default logger;
