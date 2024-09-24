import { BaseModel } from "@src/model";
import { CUSTOM_VALIDATION } from "@src/util/errors/comum-todos";
import { InternalError } from "@src/util/errors/internal-error";
import logger from "@src/util/logger";
import { Error, Model } from "mongoose";
import { AttData, FilterOptions, PopulateOptionsPersonalizado } from ".";
import {
  DatabaseInternalError,
  DatabaseUnknownClientError,
  DatabaseValidationError,
  Repository,
} from "./repository";

/**
 * Class que contém informações basicas de cada model do mongo
 * @public create
 * @public findOne
 * @public findById

 */
export abstract class BasePadraoMongoDB<
  T extends BaseModel,
  K,
> extends Repository<T, K> {
  constructor(protected model: Model<T>) {
    super();
  }

  public async create(data: Partial<T>): Promise<K> {
    try {
      const model = new this.model(data);
      const response = await model.save();
      return response.toObject<K>();
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async findOne<I = K>(
    options: FilterOptions,
    populate?: PopulateOptionsPersonalizado
  ): Promise<I | null> {
    try {
      const response = await this.model.findOne(options, {}, { populate });

      if (!response) return null;

      return response.toObject<I>();
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async findById<I = K>(
    id: string,
    populate?: PopulateOptionsPersonalizado
  ): Promise<I | null> {
    try {
      const response = await this.model.findById(id, {}, { populate });

      if (!response) return null;

      return response?.toObject<I>();
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async deleteMany(options: FilterOptions): Promise<number> {
    try {
      const deletados = await this.model.deleteMany(options);

      return deletados.deletedCount;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async find<I = K>(
    options: FilterOptions,
    populate?: PopulateOptionsPersonalizado[]
  ): Promise<I[]> {
    try {
      const dados = await this.model
        .find(options, {}, { populate })
        .sort({ createAt: "asc" });

      return dados.map((d) => d.toObject<I>());
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async updateById(id: string, att: AttData): Promise<boolean> {
    try {
      const aid: string = id;

      const dataUpdate = await this.model.findByIdAndUpdate(aid, att);

      return dataUpdate ? true : false;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async deleteOne(options: FilterOptions): Promise<number> {
    try {
      const dataDelete = await this.model.deleteOne(options);

      return dataDelete.deletedCount;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async existe(options: FilterOptions): Promise<boolean> {
    try {
      const data = await this.model.exists(options);

      return !!data;
    } catch (error) {
      this.handlerError(error);
    }
  }

  protected handlerError(error: unknown): never {
    if (error instanceof InternalError) throw error;

    if (error instanceof Error.ValidationError) {
      const duplicatedKindErrors = Object.values(error.errors).filter(
        (err) =>
          err.name == "ValidatorError" &&
          err.kind == CUSTOM_VALIDATION.DUPLICATED
      );

      if (duplicatedKindErrors.length > 0)
        throw new DatabaseValidationError(`Valor duplicado: ${error.message}`);

      throw new DatabaseUnknownClientError(
        `Erro de validação: ${error.message}`
      );
    } else if (error instanceof Error.CastError)
      throw new DatabaseValidationError(
        `O valor ${error.value} não é valido para o campo ${error.path}`
      );

    logger.error(`Error interno inesperado: ${error}`);
    throw new DatabaseInternalError(
      `Erro interno inesperado: ${(error as Error).message}`,
      500,
      "DatabaseInternalError"
    );
  }
}
