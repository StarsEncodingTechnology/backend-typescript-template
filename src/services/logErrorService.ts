import {
  LogError,
  LogErrorDepoisToObject,
  LogErrosAgrupadosPorCode,
} from "@src/model/logError";
import { LogErrorRepository } from "@src/repositories";
import cacheUtil from "@src/util/cache";
import { Converter } from "@src/util/converter";
import { InternalError } from "@src/util/errors/internal-error";
import Validador from "@src/util/validacoes/validarInfo";

class LogErrorServiceError extends InternalError {
  constructor(message: string, code = 500) {
    super(`${message}`, code, "LogErrorService");
  }
}

export default class LogErrorService {
  constructor(
    private logErrorRepository: LogErrorRepository,
    private cache = cacheUtil
  ) {}

  private validarError(error: Partial<LogError>) {
    const { message, stack, code, user_id, classError } = error;

    if (typeof message !== "string")
      throw new LogErrorServiceError("message invalido");

    if (typeof stack !== "string")
      throw new LogErrorServiceError("stack invalido");

    if (typeof code !== "number")
      throw new LogErrorServiceError("code invalido");

    if (user_id && !Validador.ObjectIdMongoose(user_id))
      throw new LogErrorServiceError("user_id invalido");

    if (classError && typeof classError !== "string")
      throw new LogErrorServiceError("classError invalido");
  }

  public async create(logError: LogError): Promise<string> {
    this.validarError(logError);
    const { id } = await this.logErrorRepository.create(logError);

    return id;
  }

  /**
   * Faz a validação dos parametros de list
   * @param tempoEmMinutos
   * @param opcoes
   */
  private validacaoParametrosListGerarFiltroMongo(
    tempoEmMinutos: number,
    opcoes?: { user_id?: string }
  ): { [key: string]: unknown } {
    if (typeof tempoEmMinutos !== "number")
      throw new LogErrorServiceError("tempoEmMinutos invalido", 422);

    if (opcoes?.user_id && !Validador.ObjectIdMongoose(opcoes.user_id))
      throw new LogErrorServiceError("user_id invalido", 422);

    const filtroOpcional: { [key: string]: unknown } = {};

    if (opcoes?.user_id) filtroOpcional["user_id"] = opcoes.user_id;

    const dataLocal = new Date(Date.now() - tempoEmMinutos * 60000);

    const dataUTC = Converter.criarDate(
      dataLocal.getUTCFullYear(),
      dataLocal.getUTCMonth(),
      dataLocal.getUTCDate(),
      dataLocal.getUTCHours(),
      dataLocal.getUTCMinutes(),
      dataLocal.getUTCSeconds()
    );

    filtroOpcional["createdAt"] = {
      $gte: dataUTC,
    };

    return filtroOpcional;
  }

  /**
   * Recupera todos os erros de log com o tempo definido
   * @param tempoEmMinutos
   * @param opcoes
   * @returns
   */
  public async list(
    tempoEmMinutos = 1,
    opcoes?: {
      user_id?: string;
    }
  ): Promise<LogErrorDepoisToObject[]> {
    const filter = this.validacaoParametrosListGerarFiltroMongo(
      tempoEmMinutos,
      opcoes
    );

    const cacheValue = this.buscarCache<LogErrorDepoisToObject[]>(
      `listError-${tempoEmMinutos}-${opcoes?.user_id}`
    );

    if (cacheValue) return cacheValue;

    const logErrors = await this.logErrorRepository.find(filter, [
      {
        path: "user_id",
        select: "name",
      },
    ]);

    this.setarCache(
      `listError-${tempoEmMinutos}-${opcoes?.user_id}`,
      logErrors
    );

    return logErrors;
  }

  /**
   * Lista todos os codes de erros que aconteceram em um determinado tempo
   */
  public async listCodes(
    tempoEmMinutos = 1,
    opcoes?: {
      user_id?: string;
    }
  ): Promise<LogErrosAgrupadosPorCode[]> {
    const filtro = this.validacaoParametrosListGerarFiltroMongo(
      tempoEmMinutos,
      opcoes
    );

    const cache = this.buscarCache<LogErrosAgrupadosPorCode[]>(
      `listCodes-${tempoEmMinutos}-${opcoes?.user_id}`
    );

    if (cache) return cache;

    const logErrors = await this.logErrorRepository.agruparPorCode(filtro);

    this.setarCache(
      `listCodes-${tempoEmMinutos}-${opcoes?.user_id}`,
      logErrors
    );

    return logErrors;
  }

  /**
   * Gerar cache para log de erro
   * @param infoKey
   * @returns
   */
  private gerarCacheKey(infoKey: string) {
    return `logError=cache:${infoKey}`;
  }

  /**
   * Busca um valor no cache
   * @param infoKey
   * @returns
   */
  private buscarCache<T>(infoKey: string) {
    const cacheKey = this.gerarCacheKey(infoKey);

    return this.cache.get<T>(cacheKey);
  }

  /**
   * Seta um valor no cache
   * @param infoKey
   * @param value
   * @param ttl
   * @returns
   */
  private setarCache<T>(infoKey: string, value: T, ttl = 10) {
    const cacheKey = this.gerarCacheKey(infoKey);
    return this.cache.set(cacheKey, value, ttl);
  }
}
