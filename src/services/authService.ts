import { EnumEstadoUser, UserDepoisToJSON } from "@src/model/user";
import { UserMongoDBRepository } from "@src/repositories/uso/userMongoDBRepository";
import { InternalError } from "@src/util/errors/internal-error";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface UserDecoded extends UserDepoisToJSON {}

/**
 * Interface que contém o JWT e o tempo para ele expirar
 * @param jwt é uma string que contém o JWT
 * @param expiraEm é uma data que contém o tempo para o JWT expirar
 */
export interface JWTGeradoInterface {
  jwt: string;
  expiraEm: Date;
}

/**
 * Interface que contém o token de 6 digitos e o tempo para ele expirar
 * @param token é uma string que contém o token de 6 digitos
 * @param expiraEm é uma data que contém o tempo para o token expirar
 */
export interface Token6Digitos {
  token: string;
  expiraEm: Date;
}

export class AuthServiceDecodarError extends InternalError {
  constructor(message: string, code = 401) {
    super(`${message}`, code, "AuthServiceDecodarError");
  }
}

/**
 * Essa é a classe que vai lidar com todas as informações envolvendo a
 * autenticação do usuario.
 */
export class AuthService {
  // constructor(protected userRepository = new userMongoDBRepository()) {}
  /**
   * Serve para criptografar a string passa.
   * @param password  A senha passa para se fazer a criptografia da mesma
   * @returns retorno uma promise de string, que retornar o texto password
   * já como hash.
   */
  public static async hashPassword(
    password: string,
    saltSecret = process.env.SALT as string
  ): Promise<string> {
    const salt: number = parseInt(saltSecret);
    return await bcrypt.hash(password, salt);
  }
  /**
   * Serve para comparar a string com o stringHash vindo do db.
   * @param password recebe a senha passada para a comparação
   * @param passwordHash recebe a senhaHash para a comparação
   * @returns Retorna uma promise booleaon caso a senha coincida true.
   * caso não false.
   */
  public static async comparaPassword(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }

  /**
   * Server para gerar um jwt com base em algum obj, tornando ele unico.
   * @param payload é um obj que pode conter qualquer informação
   * @returns retornar um OBJ que contém o JWT e o Tempo apra ele expirar
   */
  public static gerarJWT(
    payload: object,
    sign = process.env.SEGREDOJWT as string,
    time: string | null = "24h"
  ): JWTGeradoInterface {
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
      expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  public static validaJWT(
    token: string,
    sign = process.env.SEGREDOJWT as string
  ) {
    return jwt.verify(token, sign);
  }

  /**
   * Server para validar a string o token que é um JWT
   * @param token é uma string JWT
   * @returns retorna a informação que está dentro do JWT
   */
  public static async decodarJWT(
    token: string,
    url: string,
    sign = process.env.SEGREDOJWT as string,
    userRepository = new UserMongoDBRepository()
  ): Promise<{ userDecoded: UserDecoded; ip: string }> {
    const decoded = this.validaJWT(token, sign) as { id: string };
    const { id } = decoded;

    // @TODO verificar se o JWT está ativo
    // @TODO verificar se o JWT está expirado

    const userJWTCount = await userRepository.findOne({
      $and: [
        { _id: id },
        {
          JWTs: {
            $elemMatch: {
              jwt: token,
              ativo: true,
              $gt: {
                expiraEm: new Date(),
              },
            },
          },
        },
      ],
    });

    // @TODO se IP's diferentes necessidade de uma nova autenticação
    if (!userJWTCount) throw new AuthServiceDecodarError("JWT invalido");

    // // Valição de estado do usuario
    switch (userJWTCount.estado) {
      case EnumEstadoUser.bloqueado:
        throw new AuthServiceDecodarError("Usuario Bloqueado", 473);
    }

    return {
      userDecoded: userJWTCount.toJSON(),
      ip: userJWTCount.JWTs.find((jwt) => jwt.jwt == token)?.ip || "257",
    };
  }

  /**
   * Faz A geração de um token de 6 digitos
   * @returns  um token de 6 digitos random
   */
  public static gerarTokenDe6Digitos(): Token6Digitos {
    const digits = "0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    const expiraEm30Minutos = new Date(Date.now() + 30 * 60 * 1000);
    return { token: code, expiraEm: expiraEm30Minutos };
  }
}
