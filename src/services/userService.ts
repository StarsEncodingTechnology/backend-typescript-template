import { User } from "@src/model/user";
import { UserRepository } from "@src/repositories";
import { InternalError } from "@src/util/errors/internal-error";
import { AuthService, JWTGeradoInterface } from "./authService";

class UserServiceError extends InternalError {
  constructor(message: string, code = 500) {
    super(`${message}`, code, "UserService");
  }
}

export default class UserService {
  constructor(protected userRepository: UserRepository) {}

  private validateDate(data: Partial<User>, allData = false): void {
    const { email, password, name } = data;

    // Será que isso é necessário?
    // @TODO Verificar se isso é necessário
    if (allData || email !== undefined) {
      if (typeof email !== "string") {
        throw new UserServiceError("Email inválido", 422);
      }
    }

    if (allData || password !== undefined) {
      if (typeof password !== "string") {
        throw new UserServiceError("Senha inválida", 422);
      }
    }

    if (allData || name !== undefined) {
      if (name && typeof name !== "string") {
        throw new UserServiceError("Nome inválido", 422);
      }
    }
  }

  /**
   * Criate a new user
   * @param data
   * @returns
   */
  public async create(
    data: User,
    ip?: string
  ): Promise<{
    name?: string;
    token: JWTGeradoInterface;
    user_id: string;
  }> {
    this.validateDate(data);

    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    const tokenAndName = await this.autenticate(data.email, data.password, ip);

    return { ...tokenAndName, user_id: user.id };
  }

  /**
   * Aythenticate user
   * @param email
   * @param password
   * @returns
   */
  public async autenticate(
    email?: string,
    password?: string,
    ip?: string
  ): Promise<{
    name?: string;
    token: JWTGeradoInterface;
  }> {
    if (!email || !password)
      throw new UserServiceError("Email e senha são obrigatórios", 422);

    this.validateDate({ email, password });

    const user = await this.userRepository.comparaSenha(email, password);

    if (!user) throw new UserServiceError("Usuario não encontrado", 401);

    const jwt = AuthService.gerarJWT({
      id: user.id,
    });

    await this.userRepository.adicionarJWTs(user.id, jwt, ip || "");

    return { name: user.name, token: jwt };
  }
}
