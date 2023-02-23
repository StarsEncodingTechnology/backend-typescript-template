import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface DecodadaUserInterface {
  id: string;
}
/**
 * Essa é a classe que vai lidar com todas as informações envolvendo a
 * autenticação do usuario.
 */
export class AuthService {
  /**
   * Serve para criptografar a string passa.
   * @param password  A senha passa para se fazer a criptografia da mesma
   * @returns retorno uma promise de string, que retornar o texto password
   * já como hash.
   */
  public static async hashPassword(password: string): Promise<string> {
    const salt: number = parseInt(process.env.SALT as string);
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
   * @returns retornar uma string q é um codigo JWT
   */
  public static gerarJWT(payload: object): string {
    return jwt.sign(payload, process.env.SEGREDOJWT as string, {
      expiresIn: "24h",
    });
  }

  /**
   * Server para validar a string o token que é um JWT
   * @param token é uma string JWT
   * @returns retorna a informação que está dentro do JWT
   */
  public static decodarJWT(token: string): DecodadaUserInterface {
    return jwt.verify(
      token,
      process.env.SEGREDOJWT as string
    ) as DecodadaUserInterface;
  }
}
