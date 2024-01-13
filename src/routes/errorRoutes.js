import { Router } from "express";
import logger from "../service/utilities/logger.js";

const routerError = Router();

routerError.get("/loggerTest", (req, res) => {
  logger.debug("Mensaje de debug");
  logger.http("Mensaje de http");
  logger.info("Mensaje de info");
  logger.warning("Mensaje de warning");
  logger.error("Mensaje de error");
  logger.fatal("Mensaje de fatal");
  res.send("Logs generados.");
});

export default routerError;
