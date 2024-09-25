import {
  ErrorsGroupedByCode,
  LogError,
  LogErrorAfterToObject,
} from "@src/models/logError";
import { LogErrorRepository } from "@src/repositories";
import cacheUtil from "@src/utils/cache";
import { Converter } from "@src/utils/converter";
import { InternalError } from "@src/utils/errors/internal-error";
import Validator from "@src/utils/validations/validateInfo";

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

  private validateError(error: Partial<LogError>) {
    const { message, stack, code, user_id, classError } = error;

    if (typeof message !== "string")
      throw new LogErrorServiceError("invalid message");

    if (typeof stack !== "string")
      throw new LogErrorServiceError("invalid stack");

    if (typeof code !== "number")
      throw new LogErrorServiceError("invalid code");

    if (user_id && !Validator.ObjectIdMongoose(user_id))
      throw new LogErrorServiceError("invalid user_id");

    if (classError && typeof classError !== "string")
      throw new LogErrorServiceError("invalid classError");
  }

  public async create(logError: LogError): Promise<string> {
    this.validateError(logError);
    const { id } = await this.logErrorRepository.create(logError);

    return id;
  }

  /**
   * Validates the parameters for list
   * @param timeInMinutes
   * @param options
   */
  private validateListParamsGenerateMongoFilter(
    timeInMinutes: number,
    options?: { user_id?: string }
  ): { [key: string]: unknown } {
    if (typeof timeInMinutes !== "number")
      throw new LogErrorServiceError("invalid timeInMinutes", 422);

    if (options?.user_id && !Validator.ObjectIdMongoose(options.user_id))
      throw new LogErrorServiceError("invalid user_id", 422);

    const optionalFilter: { [key: string]: unknown } = {};

    if (options?.user_id) optionalFilter["user_id"] = options.user_id;

    const localDate = new Date(Date.now() - timeInMinutes * 60000);

    const utcDate = Converter.createDate(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate(),
      localDate.getUTCHours(),
      localDate.getUTCMinutes(),
      localDate.getUTCSeconds()
    );

    optionalFilter["createdAt"] = {
      $gte: utcDate,
    };

    return optionalFilter;
  }

  /**
   * Retrieves all log errors within the defined time
   * @param timeInMinutes
   * @param options
   * @returns
   */
  public async list(
    timeInMinutes = 1,
    options?: {
      user_id?: string;
    }
  ): Promise<LogErrorAfterToObject[]> {
    const filter = this.validateListParamsGenerateMongoFilter(
      timeInMinutes,
      options
    );

    const cacheValue = this.getCache<LogErrorAfterToObject[]>(
      `listError-${timeInMinutes}-${options?.user_id}`
    );

    if (cacheValue) return cacheValue;

    const logErrors = await this.logErrorRepository.find(filter, [
      {
        path: "user_id",
        select: "name",
      },
    ]);

    this.setCache(`listError-${timeInMinutes}-${options?.user_id}`, logErrors);

    return logErrors;
  }

  /**
   * Lists all error codes that occurred within a certain time
   */
  public async listCodes(
    timeInMinutes = 1,
    options?: {
      user_id?: string;
    }
  ): Promise<ErrorsGroupedByCode[]> {
    const filter = this.validateListParamsGenerateMongoFilter(
      timeInMinutes,
      options
    );

    const cache = this.getCache<ErrorsGroupedByCode[]>(
      `listCodes-${timeInMinutes}-${options?.user_id}`
    );

    if (cache) return cache;

    const logErrors = await this.logErrorRepository.groupByCode(filter);

    this.setCache(`listCodes-${timeInMinutes}-${options?.user_id}`, logErrors);

    return logErrors;
  }

  /**
   * Generate cache key for log error
   * @param infoKey
   * @returns
   */
  private generateCacheKey(infoKey: string) {
    return `logError=cache:${infoKey}`;
  }

  /**
   * Retrieves a value from the cache
   * @param infoKey
   * @returns
   */
  private getCache<T>(infoKey: string) {
    const cacheKey = this.generateCacheKey(infoKey);

    return this.cache.get<T>(cacheKey);
  }

  /**
   * Sets a value in the cache
   * @param infoKey
   * @param value
   * @param ttl
   * @returns
   */
  private setCache<T>(infoKey: string, value: T, ttl = 10) {
    const cacheKey = this.generateCacheKey(infoKey);
    return this.cache.set(cacheKey, value, ttl);
  }
}
