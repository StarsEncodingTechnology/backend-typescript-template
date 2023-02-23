import ApiError from "@src/util/errors/api-error";
import { InternalError } from "@src/util/errors/internal-error";
import { CUSTOM_VALIDATION } from "@src/util/validacoes/comum-todos";
import { Response } from "express";
import mongoose from "mongoose";

export abstract class BaseController {
  /**
   * Ela testa os erros retornados pelos processamentos e capturados
   * pelo controller. Aqui é testado e enviado a resposta com seu
   * respectivo codigo http.
   */
  protected enviaErrorResponse(res: Response, error: unknown): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.lidarComErrorsValidationError(error);
      res.status(clientErrors.code).send(
        ApiError.format({
          code: clientErrors.code,
          error: clientErrors.error,
        })
      );
    } else if (error instanceof mongoose.Error.CastError) {
      res.status(406).send(
        ApiError.format({
          code: 406,
          error: `campo ${error.path} deve ser do tipo ${error.kind}`,
        })
      );
    } else if (error instanceof InternalError) {
      res.status(error.code).send(
        ApiError.format({
          code: error.code,
          error: error.message,
        })
      );
    } else {
      res
        .status(500)
        .send(ApiError.format({ code: 500, error: "Algo errado" }));
    }
  }

  /**
   * Lida com os erros envolvendo o mongoose, comparando os kind
   * em busca de algum que coincida com o já parametrizado.
   * Caso encontre algum faz o retorno do mesmo.
   * Caso não retorna um erro de codigo generico e mensagem de acordo
   * com o erro.
   */
  private lidarComErrorsValidationError(
    error: mongoose.Error.ValidationError
  ): {
    code: number;
    error: string;
  } {
    const capturaErroDuplicado = Object.values(error.errors).filter(
      (err) =>
        err.name === "ValidatorError" &&
        err.kind === CUSTOM_VALIDATION.DUPLICATED
    );
    if (capturaErroDuplicado.length) return { code: 409, error: error.message };

    const capturaErroCNPJInvalido = Object.values(error.errors).filter(
      (err) =>
        err.name === "ValidatorError" &&
        err.kind === CUSTOM_VALIDATION.CNPJINVALIDO
    );
    if (capturaErroCNPJInvalido.length)
      return { code: 409, error: error.message };

    return { code: 422, error: error.message };
  }
}
