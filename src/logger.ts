import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import pino from "pino";
import pretty from "pino-pretty";

/**
 * Configuração do logger
 */
export default pino(
  {
    enabled: (process.env.LOENABLE as string) == "true",
    level: process.env.LOGLEVEL,
  },
  pretty({ colorize: true })
);
