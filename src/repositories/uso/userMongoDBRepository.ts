import {
  JWTInterface,
  TokenUser,
  User,
  UserDepoisToObject,
} from "@src/model/user";
import { AuthService, JWTGeradoInterface } from "@src/services/authService";
import { InternalError } from "@src/util/errors/internal-error";
import { UserRepository } from "..";
import { BasePadraoMongoDB } from "../basePadraoMongoDB";

class UserRepositoryError extends InternalError {
  constructor(message: string, code = 500) {
    super(`${message}`, code, "UserRepository");
  }
}

export class UserMongoDBRepository
  extends BasePadraoMongoDB<User, UserDepoisToObject>
  implements UserRepository
{
  // @TODO Retirar a dependencia do model de notificação
  constructor(userModel = User) {
    super(userModel);
  }

  public async comparaSenha(
    email: string,
    password: string
  ): Promise<UserDepoisToObject | undefined> {
    try {
      const user = await this.model.findOne({ email: email });

      if (!user) return;

      const auth = await AuthService.comparaPassword(password, user.password);

      if (!auth) return;

      return user.toObject<UserDepoisToObject>();
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async adicionarJWTs(
    id: string,
    jwt: JWTGeradoInterface,
    ip: string,
    ativo = true
  ): Promise<boolean> {
    try {
      const att: JWTInterface = {
        expiraEm: jwt.expiraEm,
        criadoEm: new Date(),
        ip,
        jwt: jwt.jwt,
        ativo,
      };

      const user = await this.updateById(String(id), {
        $push: { JWTs: att },
      });

      if (!user) return false;

      return true;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async atualizarLayout(id: string, layout: string): Promise<boolean> {
    try {
      const user = await this.updateById(id, { layout });

      if (!user) return false;

      return true;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async setTokenRecuperacaoSenha(
    id: string,
    token: string,
    expiraEm: Date
  ): Promise<TokenUser> {
    try {
      const user = await this.updateById(id, {
        $push: {
          changePassword: {
            token,
            expiraEm,
            ativo: true,
          },
        },
      });

      if (!user) throw new Error("Erro ao criar token de recuperação de senha");

      return {
        token,
        expiraEm,
        ativo: true,
      };
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async existsTokenReset(token: string): Promise<boolean> {
    try {
      const exists = await this.model.findOne({
        changePassword: {
          $elemMatch: {
            token,
            ativo: true,
            expiraEm: { $gte: new Date() },
          },
        },
      });

      return !!exists;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async setaTokenConfirmacaoEmail(
    id: string,
    token: string,
    expiraEm: Date
  ): Promise<boolean> {
    try {
      const user = await this.updateById(id, {
        $push: {
          tokenAtivaEmail: {
            token,
            expiraEm,
            ativo: true,
          },
        },
      });

      if (!user)
        throw new UserRepositoryError(
          "Erro ao criar token de confirmação de email"
        );

      return true;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async existsTokenConfirmacaoEmail(
    token: string
  ): Promise<string | undefined> {
    try {
      const exists = await this.model.findOne({
        tokenAtivaEmail: {
          $elemMatch: {
            token,
            ativo: true,
            expiraEm: { $gte: new Date() },
          },
        },
      });

      if (!exists) return;

      return String(exists._id);
    } catch (error) {
      this.handlerError(error);
    }
  }
}
