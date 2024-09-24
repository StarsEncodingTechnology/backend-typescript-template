import logger from "../logger";

/**
 * Sistema de captura de erro extendendo o Error
 */
export class InternalError extends Error {
  /**
   * Constructor do InternalError, serve como ralo de erros,
   * e facilitar na hora de logar
   * @param message  A mensagem que aparecera no erro
   * @param code O codigo que ia para o erro
   * @param classError A descrição do erro
   */
  public description: string;
  constructor(
    public message: string,
    public code: number = 500,
    public classError?: string
  ) {
    super(message);

    this.description = `${this.classError}: ${this.message}`;

    logger.error(this.description);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
