/**
 * Interface representing the default structure of a response.
 *
 * @interface ResponseDefaultInterface
 *
 * @property {number} code - The status code of the response.
 * @property {string} message - The message associated with the response.
 * @property {string} url - The URL related to the response.
 * @property {string} metodo - The method used for the response.
 * @property {Object.<string, unknown>} [util] - Optional additional utility data.
 * @property {Object.<string, unknown>} [data] - Optional additional response data.
 * @property {ResponseErrorDefault} [error] - Optional error details if the response indicates an error.
 */
export interface ResponseErrorDefault {
  classError?: string;
  description?: string;
  id?: string;
}

export interface ResponseDefaultInterface {
  code: number;
  message: string;
  url: string;
  metodo: string;
  util?: { [key: string]: unknown };
  data?: { [key: string]: unknown };
  error?: ResponseErrorDefault;
}

/**
 * Classe para padronizar as respostas da API
 */
export default class ResponseDefault {
  private code: number;
  private message: string;
  private url: string;
  private metodo: string;
  private link?: { [key: string]: unknown };
  private data?: { [key: string]: unknown };
  private error: undefined | ResponseErrorDefault;

  private version = {
    api: process.env.VERSIONAPI || "NO_SET-VERSION",
    web: "1.0.0",
    android: "1.0.0",
    ios: "1.0.0",
  };
  private mod = process.env.MOD || "NO_SET-MOD";
  constructor(obj: ResponseDefaultInterface) {
    this.code = obj.code;
    this.message = obj.message;
    this.link = obj.util;
    this.url = obj.url;
    this.metodo = obj.metodo;
    this.data = obj.data;
    this.error = obj.error;
  }

  get responseData() {
    return {
      code: this.code,
      message: this.message,
      url: this.url,
      link: this.link,
      metodo: this.metodo,
      error: this.error,
      data: this.data,
      versions: {
        version: this.version,
        mod: this.mod,
      },
    };
  }

  //--------------------------------------------------------------------------------
  // For testing purposes only
  /**
   * Testing utility to determine if an object is a ResponseDefault instance.
   */
  public static isResponseDefault(obj: unknown): obj is ResponseDefault {
    return (
      typeof obj === "object" &&
      typeof (obj as ResponseDefault).code === "number" &&
      typeof (obj as ResponseDefault).message === "string" &&
      typeof (obj as ResponseDefault).url === "string" &&
      typeof (obj as ResponseDefault).metodo === "string" &&
      (typeof (obj as ResponseDefault).link === "object" ||
        typeof (obj as ResponseDefault).link === "undefined") &&
      (typeof (obj as ResponseDefault).data === "object" ||
        typeof (obj as ResponseDefault).data === "undefined") &&
      (typeof (obj as ResponseDefault).error === "object" ||
        typeof (obj as ResponseDefault).error === "undefined")
    );
  }
}
