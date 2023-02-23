import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import pino from "pino";

export default pino({
  enabled: (process.env.LOENABLE as string) == "true",
  level: process.env.LOGLEVEL,
});
