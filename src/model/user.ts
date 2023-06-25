import mongoose, { Document } from "mongoose";
import { AuthService } from "@src/services/authService";
import Validador from "@src/util/validacoes/validarInfo";
import { CUSTOM_VALIDATION } from "@src/util/validacoes/comum-todos";

export interface User {
  _id?: string;
  nome: string;
  email: string;
  password: string;
  CNPJ: string;
}

const schema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    CNPJ: { type: String, required: true, unique: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
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

schema
  .path("CNPJ")
  .validate(
    async (CNPJ: string) => {
      const cnpjCount = await mongoose.models.User.countDocuments({
        CNPJ: CNPJ,
      });
      return !cnpjCount;
    },
    "CNPJ já cadastrado.",
    CUSTOM_VALIDATION.DUPLICATED
  )
  .validate(
    // teste se cnpj é valido
    async (CNPJ: string) => {
      return Validador.CNPJ(CNPJ);
    },
    "CNPJ Invalido.",
    CUSTOM_VALIDATION.CNPJINVALIDO
  );

schema.pre<UserModel>("save", async function (): Promise<void> {
  if (!this.password || !this.isModified("password")) return;

  try {
    const passwordHash = await AuthService.hashPassword(this.password);
    this.password = passwordHash;
  } catch (e) {
    //@TODO validar isso aqui
    console.error(`Erro no hash do password do usuario ${this.nome}`);
  }
});

export const User = mongoose.model<UserModel>("User", schema);
