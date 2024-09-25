import { UserAfterToJSON, UserState } from "@src/model/user";
import { UserMongoDBRepository } from "@src/repositories/uso/userMongoDBRepository";
import { InternalError } from "@src/util/errors/internal-error";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface UserDecoded extends UserAfterToJSON {}

/**
 * Interface that contains the JWT and the time for it to expire
 * @param jwt is a string that contains the JWT
 * @param expiresIn is a date that contains the time for the JWT to expire
 */
export interface GeneratedJWTInterface {
  jwt: string;
  expiresIn: Date;
}

/**
 * Interface that contains the 6-digit token and the time for it to expire
 * @param token is a string that contains the 6-digit token
 * @param expiresIn is a date that contains the time for the token to expire
 */
export interface Token6Digits {
  token: string;
  expiresIn: Date;
}

export class AuthServiceDecodeError extends InternalError {
  constructor(message: string, code = 401) {
    super(`${message}`, code, "AuthServiceDecodeError");
  }
}

/**
 * This is the class that will handle all the information involving user authentication.
 */
export class AuthService {
  // constructor(protected userRepository = new userMongoDBRepository()) {}
  /**
   * Used to encrypt the given string.
   * @param password The password passed to be encrypted
   * @returns returns a promise of string, which returns the password text already as hash.
   */
  public static async hashPassword(
    password: string,
    saltSecret = process.env.SALT as string
  ): Promise<string> {
    const salt: number = parseInt(saltSecret);
    return await bcrypt.hash(password, salt);
  }
  /**
   * Used to compare the string with the stringHash coming from the db.
   * @param password receives the password passed for comparison
   * @param passwordHash receives the passwordHash for comparison
   * @returns Returns a boolean promise if the password matches true. if not false.
   */
  public static async comparePassword(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }

  /**
   * Used to generate a jwt based on some obj, making it unique.
   * @param payload is an obj that can contain any information
   * @returns returns an OBJ that contains the JWT and the time for it to expire
   */
  public static generateJWT(
    payload: object,
    sign = process.env.JWT_SECRET as string,
    time: string | null = "24h"
  ): GeneratedJWTInterface {
    return {
      jwt: jwt.sign(
        payload,
        sign,
        time == null
          ? {}
          : {
              expiresIn: time,
            }
      ),
      expiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  public static validateJWT(
    token: string,
    sign = process.env.JWT_SECRET as string
  ) {
    return jwt.verify(token, sign);
  }

  /**
   * Used to validate the string token which is a JWT
   * @param token is a JWT string
   * @returns returns the information inside the JWT
   */
  public static async decodeJWT(
    token: string,
    url: string,
    sign = process.env.JWT_SECRET as string,
    userRepository = new UserMongoDBRepository()
  ): Promise<{ userDecoded: UserDecoded; ip: string }> {
    const decoded = this.validateJWT(token, sign) as { id: string };
    const { id } = decoded;

    // @TODO check if the JWT is active
    // @TODO check if the JWT is expired

    const userJWTCount = await userRepository.findOne({
      $and: [
        { _id: id },
        {
          JWTs: {
            $elemMatch: {
              jwt: token,
              active: true,
              $gt: {
                expiresIn: new Date(),
              },
            },
          },
        },
      ],
    });

    // @TODO if different IPs need new authentication
    if (!userJWTCount) throw new AuthServiceDecodeError("Invalid JWT");

    // // User state validation
    switch (userJWTCount.state) {
      case UserState.blocked:
        throw new AuthServiceDecodeError("User Blocked", 473);
    }

    return {
      userDecoded: userJWTCount.toJSON(),
      ip:
        userJWTCount.JWTs.find(
          (jwt: { jwt: string; ip: string }) => jwt.jwt == token
        )?.ip || "257",
    };
  }

  /**
   * Generates a 6-digit token
   * @returns a random 6-digit token
   */
  public static generate6DigitToken(): Token6Digits {
    const digits = "0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    const expiresIn30Minutes = new Date(Date.now() + 30 * 60 * 1000);
    return { token: code, expiresIn: expiresIn30Minutes };
  }
}
