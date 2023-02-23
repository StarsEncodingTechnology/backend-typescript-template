import * as dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});
import { SetupServer } from "./server";

(async () => {
  const server = new SetupServer();
  await server.init();
  server.start();
})();
