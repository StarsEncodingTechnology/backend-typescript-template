/* eslint-disable @typescript-eslint/no-unused-vars */
import ResponseDefault from "@src/util/responseDefault";
import { NextFunction, Request, Response } from "express";

export interface HTTPError extends Error {
  status?: number;
}

/**
 * Faz a captura de possiveis erros na primeira camada.
 * @param error erro HTTP
 * @param req req do express
 * @param res res do express
 * @param __ next mas não é utilizado
 */
export function apiErrorValidador(
  error: HTTPError,
  req: Partial<Request>,
  res: Response,
  __: NextFunction
): void {
  const errorCode = error.status || 500;

  const responseError = new ResponseDefault({
    code: errorCode,
    message: error.message,
    url: req.url || "",
    method: req.method || "",
    error: {
      classError: "ApiErrorValidador",
      description: error.message,
    },
  });

  res.status(errorCode).json(responseError.responseData);
}
