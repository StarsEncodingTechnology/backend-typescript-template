import { model, Schema } from "mongoose";
import {
  BaseDepoisToObject,
  BaseModel,
  BaseStringObjectId,
  converteCasoNecessario,
} from ".";

export interface LogError extends BaseModel {
  /**
   * Rotas que geraram o erro
   */
  path: string;
  /**
   * Metodo que gerou o erro
   */
  method: string;

  /**
   * Error message
   */
  message: string;
  /**
   * Lista de funcões que o erro passou
   */
  stack: string;
  /**
   * Codigo do erro
   */
  code: number;
  /**
   * faz referencia ao id do usuario que gerou o erro
   */
  user_id?: BaseStringObjectId;

  /**
   * Data de criação do erro
   */
  classError?: string;
  /**
   * Data de criação do erro
   */
  createdAt?: Date;
}

export interface LogErrorComId extends LogError {
  id: string;
  user_id?: string;
  /**
   * Data de criação do erro
   */
  createdAt: Date;
}

export interface LogErrorDepoisToObject extends Omit<LogErrorComId, ""> {}

export interface LogErrorDepoisToObject
  extends BaseDepoisToObject<LogErrorComId, LogErrorDepoisToObject> {}

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

        converteCasoNecessario(ret, ["user_id"]);

        ret.toJSON = () => ret;
      },
    },
  }
);

export const LogError = model<LogError>("LogError", schema);

/**
 * Interface para agrupar os erros por code
 */
export interface LogErrosAgrupadosPorCode {
  code: number;
  quantidade: number;
}
