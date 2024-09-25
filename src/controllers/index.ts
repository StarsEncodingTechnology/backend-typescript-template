import {
  DatabaseError,
  DatabaseUnknownClientError,
  DatabaseValidationError,
} from "@src/repositories/repository";
import LogErrorService from "@src/services/logErrorService";
import { InternalError } from "@src/util/errors/internal-error";
import logger from "@src/util/logger";
import ResponseDefault, {
  ResponseErrorDefault,
} from "@src/util/responseDefault";
import { Request, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import path from "path";

export abstract class BaseController {
  private localdist = path.resolve(__dirname, "..", "..");
  constructor(private logErrorService: LogErrorService) {}

  /**
   * Faz o processamento das informações do req e retorna um objeto
   * @param req Request
   * @returns Object contendo as informações do req
   */
  private recuperaInformacoesRequest(req: Request) {
    const protocol = req.protocol;
    const host = req.get("host");
    const path = req.originalUrl;
    const url = `${protocol}://${host}${path}`;
    const method = req.method;

    const user = req?.decoded;

    const user_id = user?.id;
    return {
      protocol,
      host,
      path,
      url,
      method,
      user,
      user_id,
    };
  }

  /**
   * Salva no db o erro gerado pelo sistema
   * @param path Caminhão depois da /
   * @param message  Mensagem de erro
   * @param stack  Pilha de erro
   * @param code  Codigo do erro
   * @param method  Metodo que gerou o erro
   * @param user_id  Id do usuario que gerou o erro
   * @param classError  Classe do erro
   */
  private async gerarLogError(
    path: string,
    message: string,
    stack: string,
    code: number,
    method: string,
    user_id?: string,
    classError?: string
  ): Promise<undefined | string> {
    const stackLimpo =
      code === 500
        ? stack.replaceAll(this.localdist, "").split("node_modules")[0]
        : stack.replaceAll(this.localdist, "").split("\n")[0];

    const id = await this.logErrorService
      .create({
        path,
        message,
        stack: stackLimpo,
        code,
        user_id,
        classError,
        method,
      })
      .catch((e) => {
        console.log("Error aqui");
        console.log({ e });
        logger.error({ loq: "error ao salvar logError", e });
        return undefined;
      });

    return id;
  }

  /**
   * Faz o processamento do erro e retorna um objeto com as informações
   * @param req Request
   * @param error Unknown
   * @returns Object contendo as informações
   */
  protected processaError(
    _: Request,
    error: unknown
  ): {
    code: number;
    message: string;
    error: ResponseErrorDefault;
    stack?: string;
  } {
    // Mongoose error about validation of data
    if (error instanceof DatabaseValidationError) {
      const clientErrors = this.lidarComErrorsValidationError(error);
      return {
        code: clientErrors.code,
        message: clientErrors.error,
        error: {
          classError: "DatabaseValidationError",
          description: error.message,
        },
        stack: error.stack,
      };
    }
    // Mongoose error about unknown client
    else if (error instanceof DatabaseUnknownClientError) {
      return {
        code: 400,
        message: error.message,
        error: {
          classError: "DatabaseUnknownClientError",
          description: error.message,
        },
        stack: error.stack,
      };
    }
    // Internal server error
    // Errors addressed previously
    else if (error instanceof InternalError) {
      return {
        code: error.code,
        message: error.message,
        error: {
          classError: error.classError,
          description: error.description,
        },
        stack: error.stack,
      };
    }
    // JWT error about token validation
    else if (error instanceof JsonWebTokenError) {
      return {
        code: 401,
        message: error.message,
        error: {
          classError: "JsonWebTokenError",
          description: error.message,
        },
        stack: error.stack,
      };
    }

    logger.error({ loq: "error sem tabela", error });

    // Unknown error
    return {
      code: 500,
      message: (error as Error).message,
      error: {
        classError: "NO class error",
        description: (error as Error).name + " - " + (error as Error).message,
      },
      stack: (error as Error).stack,
    };
  }

  /**
   * Ela testa os erros retornados pelos processamentos e capturados
   * pelo controller. Aqui é testado e enviado a resposta com seu
   * respectivo codigo http.
   */
  protected async apiError(
    req: Request,
    res: Response,
    error: unknown
  ): Promise<void> {
    const {
      code,
      message,
      error: errorObj,
      stack,
    } = this.processaError(req, error);

    const { path, method, user_id } = this.recuperaInformacoesRequest(req);

    const id = await this.gerarLogError(
      path,
      errorObj?.description || message,
      stack || "no-stack",
      code,
      method,
      user_id,
      errorObj?.classError
    );

    if (code === 500) {
      return this.apiResponse({
        req,
        res,
        code,
        message: "InternalError",
        error: {
          classError: "InternalError",
          description: "Internal error occurred",
          id,
        },
      });
    }

    this.apiResponse({
      req,
      res,
      code,
      message,
      error: { ...errorObj, id },
    });
  }

  /**
   * Lida com os erros envolvendo o mongoose, comparando os kind
   * em busca de algum que coincida com o já parametrizado.
   * Caso encontre algum faz o retorno do mesmo.
   * Caso não retorna um erro de codigo generico e mensagem de acordo
   * com o erro.
   */
  private lidarComErrorsValidationError(error: DatabaseError): {
    code: number;
    error: string;
  } {
    if (error instanceof DatabaseValidationError)
      return { code: 409, error: error.message };

    return { code: 422, error: error.message };
  }

  /**
   *  Método para padronizar as respostas da API
   * @param req Request do express
   * @param res Response do express
   * @param status status da resposta http
   * @param message Mensagem de retorno
   * @param link Links do retorno
   * @param data Caso tenha que passar informações
   * @param error Mensagem de erro caso exista
   */
  protected async apiResponse({
    req,
    res,
    code,
    message,
    util,
    data,
    error,
  }: {
    req: Request;
    res: Response;
    code: number;
    message: string;
    util?: { [key: string]: unknown };
    data?: { [key: string]: unknown };
    error?: ResponseErrorDefault;
  }): Promise<void> {
    const { url, method, user } = this.recuperaInformacoesRequest(req);

    const utilC = {
      user: util?.user || user || undefined,
    };

    const dataResponse = new ResponseDefault({
      code,
      message,
      util: { ...util, ...utilC },
      url,
      method,
      data,
      error: error,
    });

    res.status(code).send(dataResponse.responseData);
  }
}
