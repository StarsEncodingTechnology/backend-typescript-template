import * as http from "http";
import { UserDecoded } from "./services/authService";

/**
 * Essa arquivo coloca mais 1 informação no Request de todas as,
 * rotas da aplicação
 */
declare module "express-serve-static-core" {
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: UserDecoded;
  }
}
