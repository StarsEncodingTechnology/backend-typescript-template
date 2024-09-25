import { InternalError } from "@src/utils/errors/internal-error";
import {
  AttData,
  BaseRepository,
  CustomPopulateOptions,
  FilterOptions,
} from "./index";

export class DatabaseError extends InternalError {
  constructor(message: string, code = 500, classError = "DatabaseError") {
    super(message, code, classError);
  }
}

export class DatabaseValidationError extends DatabaseError {}

export class DatabaseUnknownClientError extends DatabaseError {}

export class DatabaseInternalError extends DatabaseError {}

export abstract class Repository<T, K> implements BaseRepository<T, K> {
  public abstract create(data: Partial<T>): Promise<K>;
  public abstract findOne<I = K>(
    options: FilterOptions,
    populate?: CustomPopulateOptions
  ): Promise<I | null>;
  public abstract findById<I = K>(id: string): Promise<I | null>;
  public abstract deleteMany(options: FilterOptions): Promise<number>;
  public abstract find<I = K>(
    options: FilterOptions,
    populate?: CustomPopulateOptions[]
  ): Promise<I[]>;
  public abstract updateById(id: string, att: AttData): Promise<boolean>;
  public abstract deleteOne(options: FilterOptions): Promise<number>;
  public abstract exists(options: FilterOptions): Promise<boolean>;
}
