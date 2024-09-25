import { model, Schema } from "mongoose";
import {
  BaseAfterToObject,
  BaseModel,
  BaseStringObjectId,
  convertIfNecessary,
} from ".";

export interface LogError extends BaseModel {
  /**
   * Routes that generated the error
   */
  path: string;
  /**
   * Method that generated the error
   */
  method: string;

  /**
   * Error message
   */
  message: string;
  /**
   * List of functions the error passed through
   */
  stack: string;
  /**
   * Error code
   */
  code: number;
  /**
   * References the ID of the user who generated the error
   */
  user_id?: BaseStringObjectId;

  /**
   * Class of the error
   */
  classError?: string;
  /**
   * Error creation date
   */
  createdAt?: Date;
}

export interface LogErrorWithId extends LogError {
  id: string;
  user_id?: string;
  /**
   * Error creation date
   */
  createdAt: Date;
}

export interface LogErrorAfterToObject extends Omit<LogErrorWithId, ""> {}

export interface LogErrorAfterToObject
  extends BaseAfterToObject<LogErrorWithId, LogErrorAfterToObject> {}

const schema = new Schema<LogError>(
  {
    user_id: { type: Schema.ObjectId, ref: "User" },
    message: { type: String, required: true },
    stack: { type: String, required: true },
    code: { type: Number, required: true },
    createdAt: {
      type: Date,
      required: true,
      default: new Date().toUTCString(),
    },
    classError: { type: String },
    path: { type: String, required: true },
    method: { type: String, required: true },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;

        convertIfNecessary(ret, ["user_id"]);

        ret.toJSON = () => ret;
      },
    },
  }
);

export const LogError = model<LogError>("LogError", schema);

/**
 * Interface to group errors by code
 */
export interface ErrorsGroupedByCode {
  code: number;
  quantity: number;
}
