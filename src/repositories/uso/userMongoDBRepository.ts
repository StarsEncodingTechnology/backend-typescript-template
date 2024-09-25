import {
  JWTInterface,
  User,
  UserAfterToObject,
  UserToken,
} from "@src/models/user";
import { AuthService, GeneratedJWTInterface } from "@src/services/authService";
import { InternalError } from "@src/util/errors/internal-error";
import { UserRepository } from "..";
import { BaseDefaultMongoDB } from "../baseDefaultMongoDB";

class UserRepositoryError extends InternalError {
  constructor(message: string, code = 500) {
    super(`${message}`, code, "UserRepository");
  }
}

export class UserMongoDBRepository
  extends BaseDefaultMongoDB<User, UserAfterToObject>
  implements UserRepository
{
  // @TODO Remove the dependency on the notification model
  constructor(userModel = User) {
    super(userModel);
  }

  public async comparePassword(
    email: string,
    password: string
  ): Promise<UserAfterToObject | undefined> {
    try {
      const user = await this.model.findOne({ email: email });

      if (!user) return;

      const auth = await AuthService.comparePassword(password, user.password);

      if (!auth) return;

      return user.toObject<UserAfterToObject>();
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async addJWTs(
    id: string,
    jwt: GeneratedJWTInterface,
    ip: string,
    active = true
  ): Promise<boolean> {
    try {
      const att: JWTInterface = {
        expiresAt: jwt.expiresIn,
        createdAt: new Date(),
        ip,
        jwt: jwt.jwt,
        active,
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

  public async updateLayout(id: string, layout: string): Promise<boolean> {
    try {
      const user = await this.updateById(id, { layout });

      if (!user) return false;

      return true;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async setPasswordRecoveryToken(
    id: string,
    token: string,
    expiresAt: Date
  ): Promise<UserToken> {
    try {
      const user = await this.updateById(id, {
        $push: {
          changePassword: {
            token,
            expiresAt,
            active: true,
          },
        },
      });

      if (!user) throw new Error("Error creating password recovery token");

      return {
        token,
        expiresAt,
        active: true,
      };
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async existsResetToken(token: string): Promise<boolean> {
    try {
      const exists = await this.model.findOne({
        changePassword: {
          $elemMatch: {
            token,
            active: true,
            expiresIn: { $gte: new Date() },
          },
        },
      });

      return !!exists;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async setEmailConfirmationToken(
    id: string,
    token: string,
    expiresIn: Date
  ): Promise<boolean> {
    try {
      const user = await this.updateById(id, {
        $push: {
          emailActivationToken: {
            token,
            expiresIn,
            active: true,
          },
        },
      });

      if (!user)
        throw new UserRepositoryError(
          "Error creating email confirmation token"
        );

      return true;
    } catch (error) {
      this.handlerError(error);
    }
  }

  public async existsEmailConfirmationToken(
    token: string
  ): Promise<string | undefined> {
    try {
      const exists = await this.model.findOne({
        emailActivationToken: {
          $elemMatch: {
            token,
            active: true,
            expiresIn: { $gte: new Date() },
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
