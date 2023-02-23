/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import ApiError from "@src/util/errors/api-error";

export interface HTTPError extends Error {
  status?: number;
}

/**
 * Faz a captura de possiveis erros na primeira camada.
 * @param error erro HTTP
 * @param _  req mas n é utlizado
 * @param res res do express
 * @param __ next mas não é utilizado
 */
export function apiErrorValidador(
  error: HTTPError,
  _: Partial<Request>,
  res: Response,
  __: NextFunction
): void {
  const errorCode = error.status || 500;
  res
    .status(errorCode)
    .json(ApiError.format({ code: errorCode, error: error.message }));
}
