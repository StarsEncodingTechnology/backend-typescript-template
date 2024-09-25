import { BaseModel } from "@src/model";
import { CUSTOM_VALIDATION } from "@src/util/errors/allComum";
import { InternalError } from "@src/util/errors/internal-error";
import logger from "@src/util/logger";
import { Error, Model } from "mongoose";
import { AttData, CustomPopulateOptions, FilterOptions } from ".";
import {
  DatabaseInternalError,
  DatabaseUnknownClientError,
  DatabaseValidationError,
  Repository,
} from "./repository";

/**
 * Class that contains basic information for each MongoDB model
 * @public create
 * @public findOne
 * @public findById
 */
export abstract class BaseDefaultMongoDB<
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
    populate?: CustomPopulateOptions
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
    populate?: CustomPopulateOptions
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
      const deleted = await this.model.deleteMany(options);

      return deleted.deletedCount;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async find<I = K>(
    options: FilterOptions,
    populate?: CustomPopulateOptions[]
  ): Promise<I[]> {
    try {
      const data = await this.model
        .find(options, {}, { populate })
        .sort({ createAt: "asc" });

      return data.map((d) => d.toObject<I>());
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

  public async exists(options: FilterOptions): Promise<boolean> {
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
        throw new DatabaseValidationError(`Duplicate value: ${error.message}`);

      throw new DatabaseUnknownClientError(
        `Validation error: ${error.message}`
      );
    } else if (error instanceof Error.CastError)
      throw new DatabaseValidationError(
        `The value ${error.value} is not valid for the field ${error.path}`
      );

    logger.error(`Unexpected internal error: ${error}`);
    throw new DatabaseInternalError(
      `Unexpected internal error: ${(error as Error).message}`,
      500,
      "DatabaseInternalError"
    );
  }
}
