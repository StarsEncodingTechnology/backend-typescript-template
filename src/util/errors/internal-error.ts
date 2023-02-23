/**
 * Sistema de captura de erro extendendo o Error
 */
export class InternalError extends Error {
  /**
   * Constructor do InternalError, serve como ralo de erros,
   * e facilitar na hora de logar
   * @param message  A mensagem que aparecera no erro
   * @param code O codigo que ia para o erro
   * @param description A descrição do erro
   */
  constructor(
    public message: string,
    public code: number = 500,
    protected description?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
