import * as dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});
import pino from "pino";
import pretty from "pino-pretty";

export default pino(
  {
    enabled: (process.env.LOGENABLE as string) == "true",
    level: process.env.LOGLEVEL,
  },
  pretty({ colorize: true })
);
