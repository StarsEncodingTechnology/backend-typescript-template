/**
 * Interface que será passada ao Format error
 */
export interface APIError {
  code: number;
  error: string;
  codeAsString?: string; //allow to override the default error code as string
  description?: string;
  documentation?: string;
}

/**
 * retorno da Formatação da api erro
 */
export interface APIErrorResponse extends Omit<APIError, "codeAsString"> {
  error: string;
}

/**
 * Faz a padronização dos erros
 * @returns Retorna objeto de formato adequado ao erro.
 */
export default class ApiError {
  public static format(error: APIError): APIErrorResponse {
    return {
      ...{
        error: error.error,
        code: error.code,
      },
      ...(error.documentation && { documentation: error.documentation }),
      ...(error.description && { description: error.description }),
    };
  }
}
