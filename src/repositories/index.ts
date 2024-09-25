// Database abstraction configuration file
// Used to utilize multiple databases in the same system so that they do not interfere with each other
// Preventing library errors from propagating to other environments

import { User, UserAfterToObject, UserToken } from "@src/model/user";

import {
  LogError,
  LogErrorDepoisToObject,
  LogErrosAgrupadosPorCode,
} from "@src/model/logError";
import { GeneratedJWTInterface } from "@src/services/authService";
import { PopulateOptions } from "mongoose";

export type FilterOptions = Record<string, unknown>;

export type AttData = Record<string, unknown>;

/**
 * Options to populate information
 * @param path field to be populated
 * @param campos fields to be populated
 * @param populate recursively populated, can populate more than one field
 */
export interface CustomPopulateOptions extends PopulateOptions {}

/**
 * Base for all Repositories
 */
export interface BaseRepository<T, K> {
  /**
   * Creates a record in the database
   * @param data information to be saved
   */
  create(data: Partial<T>): Promise<K>;
  /**
   * Searches for information based on the passed parameters,
   * the information for populate must be adjusted directly in the model Schema
   * to avoid breaking the system
   * @param options Options for Query to locate
   * @param populate Options for Query to locate with populate
   */
  findOne<I = K>(
    options: FilterOptions,
    populate?: CustomPopulateOptions
  ): Promise<I | null>;

  /**
   * Searches for information based on the passed id
   * @param id to locate the information
   */
  findById<I = K>(
    id: string,
    populate?: CustomPopulateOptions
  ): Promise<I | null>;

  /**
   * Searches for information in the database
   * @param options Options to be searched
   */
  find<I = K>(
    options: FilterOptions,
    populate?: CustomPopulateOptions[]
  ): Promise<I[]>;

  /**
   * Deletes multiple records at once
   * @param options Options to be deleted
   */
  deleteMany(options: FilterOptions): Promise<number>;

  /**
   * Deletes a single record
   * @param options target to be deleted
   */
  deleteOne(options: FilterOptions): Promise<number>;

  /**
   * Updates information for a single ID
   * @param id of the data to be updated
   * @param att data to be updated
   */
  updateById(id: string, att: AttData): Promise<boolean>;

  /**
   * Checks if information exists in the database
   * @param options Options for Query to locate
   */
  exists(options: FilterOptions): Promise<boolean>;
}

/**
 * User Repository
 */
export interface UserRepository
  extends BaseRepository<User, UserAfterToObject> {
  /**
   * Compares the password
   * @param email
   * @param password
   */
  comparePassword(
    email: string,
    password: string
  ): Promise<UserAfterToObject | undefined>;
  /**
   * Adds the JWT to the database
   * @param id user id
   * @param jwt object with the jwt and expiration time
   * @param ip user ip
   * @param active if the jwt is active or not
   * @returns
   */
  addJWTs(id: string, jwt: GeneratedJWTInterface, ip: string): Promise<boolean>;

  /**
   * Sets the password recovery token in the database
   * @param id user id
   * @param token password recovery token
   * @param expiresIn token expiration time
   */
  setPasswordRecoveryToken(
    id: string,
    token: string,
    expiresIn: Date
  ): Promise<UserToken>;
  /**
   * Checks if the token exists in the database and is valid for use
   * @param token
   */
  existsResetToken(token: string): Promise<boolean>;

  /**
   * Sets the email confirmation token in the DB
   * @param id  User_id
   * @param token  confirmation token
   * @param expiresIn maximum time for confirmation
   */
  setEmailConfirmationToken(
    id: string,
    token: string,
    expiresIn: Date
  ): Promise<boolean>;

  /**
   * Checks if the email confirmation token exists in the database
   * @param token
   */
  existsEmailConfirmationToken(token: string): Promise<string | undefined>;
}

/**
 * LogError Repository
 */
export interface LogErrorRepository
  extends BaseRepository<LogError, LogErrorDepoisToObject> {
  /**
   * Groups errors by code
   */
  groupByCode(filter: FilterOptions): Promise<LogErrosAgrupadosPorCode[]>;
}
