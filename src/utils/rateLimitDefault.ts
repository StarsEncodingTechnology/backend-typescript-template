import { Request } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import ResponseDefault from "./responseDefault";

/**
 * Faz a criação de uma nova funcão para o rate limit
 * @param minutos quantos minutos de janela
 * @param rateMax quantidade de tentativas maximas
 * @param message
 * @returns
 */
function RateLimitCreator(
  minutos = 1,
  message = "Muitas tentativas de acesso, tente novamente mais tarde.",
  rateMax = Number(process.env.RATELIMITWINDOW_DEFAULT as string)
): RateLimitRequestHandler {
  return rateLimit({
    windowMs: 60 * 1000 * minutos,
    max: rateMax,
    keyGenerator(req: Request): string {
      const aip: string = req.ip || "----";
      return aip;
    },
    message: message,
    handler: (request, response, __, option) => {
      const newResponse = new ResponseDefault({
        code: 429,
        message: option.message,
        url: `${request.protocol}://${request.get("host")}${
          request.originalUrl
        }`,
        method: request.method,
        error: option.message,
      });

      response.status(429).send(newResponse.responseData);
    },
  });
}

export default RateLimitCreator;
