import { AuthService } from "@src/services/authService";
import { CUSTOM_VALIDATION } from "@src/util/validacoes/comum-todos";
import mongoose, { Document } from "mongoose";
import {
  BaseDepoisToObject,
  BaseModel,
  BaseStringObjectId,
  converteCasoNecessario,
} from ".";

/**
 * JWTInterface é o que é salvo no banco de dados
 */
export interface JWTInterface {
  criadoEm: Date;
  expiraEm: Date;
  ip: string;
  jwt: string;
  ativo: boolean;
}

/**
 * Faz parte do processo de recuperação de senha
 */
export interface TokenUser {
  token: string;
  expiraEm: Date;
  ativo: boolean;
}

/**
 * Enum que contém os estados que o usuário pode estar,
 * Essa informação é checada no nivel de middleware
 */
export enum EnumEstadoUser {
  /**
   * Usuário está pronto para uso
   */
  ativo = "ativo",
  /**
   * Quando o user passar X tempo sem utilizar o sistema
   */
  inativo = "inativo",
  /**
   * Estado do usuário que foi bloqueado
   */
  bloqueado = "bloqueado",
  /**
   * Estado do usuário que não verificou o email
   * @default
   */
  emailNaoVerificado = "emailNaoVerificado",
}

/**
 * Antes da transformação do User com o .toJSON()
 */
export interface User extends BaseModel {
  ativa?: BaseStringObjectId | null;
  name?: string;
  email: string;
  password: string;
  JWTs: JWTInterface[];
  changePassword: TokenUser[];
  estado: EnumEstadoUser;
  /**
   * É o campo cliente_id da api de pagamento
   */
  cliente_id?: string;
}

export interface UserComId extends User {
  id: string;
  ativa: string;
}

/**
 * Depois da transformação do User com o .toJSON()
 */
export interface UserDepoisToJSON
  extends Omit<
    UserComId,
    "password" | "JWTs" | "email" | "changePassword" | "cliente_id"
  > {}

export interface UserDepoisToObject
  extends BaseDepoisToObject<UserComId, UserDepoisToJSON> {}

const schema = new mongoose.Schema<User>(
  {
    name: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    JWTs: {
      type: [
        {
          criadoEm: { type: Date, required: true },
          expiraEm: { type: Date, required: true },
          ip: { type: String, required: true },
          jwt: { type: String, required: true },
          ativo: { type: Boolean, required: true },
        },
      ],
      default: [],
    },
    changePassword: {
      type: [
        {
          token: { type: String, required: true },
          expiraEm: { type: Date, required: true },
          ativo: { type: Boolean, required: true },
        },
      ],
      default: [],
    },
    estado: {
      type: String,
      required: true,
      enum: Object.values(EnumEstadoUser),
      default: EnumEstadoUser.emailNaoVerificado,
    },
    cliente_id: { type: String, required: false },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;

        ret.password = undefined;
        ret.email = undefined;
        ret.JWTs = undefined;
        ret.changePassword = undefined;
        ret.cliente_id = undefined;
      },
    },

    toObject: {
      transform: (_, ret): void => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;

        converteCasoNecessario(ret, ["_id"]);

        ret.toJSON = () => {
          return JSON.parse(
            JSON.stringify({
              ...ret,
              toJSON: undefined,
              password: undefined,
              email: undefined,
              JWTs: undefined,
              changePassword: undefined,
              cliente_id: undefined,
            })
          );
        };
      },
    },

    versionKey: false,
  }
);

interface UserModel extends Omit<User, "_id">, Document {}

schema.path("email").validate(
  async (email: string) => {
    const emailCount = await mongoose.models.User.countDocuments({ email });
    return !emailCount;
  },
  "Email já cadastrado.",
  CUSTOM_VALIDATION.DUPLICATED
);
// trás o erro da informação duplicada para a camada do mongoose
// fazendo ele parar de retornar um erro diretamenta do MongoDB

schema.pre<UserModel>("save", async function (): Promise<void> {
  if (!this.password || !this.isModified("password")) return;

  try {
    const passwordHash = await AuthService.hashPassword(this.password);
    this.password = passwordHash;
  } catch (e) {
    //@TODO validar isso aqui
    console.error(`Erro no hash do password do usuario ${this.name}`);
  }
});

export const User = mongoose.model<User>("User", schema);
