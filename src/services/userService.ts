import { User } from "@src/models/user";
import { UserRepository } from "@src/repositories";
import { InternalError } from "@src/util/errors/internal-error";
import { AuthService, GeneratedJWTInterface } from "./authService";

class UserServiceError extends InternalError {
  constructor(message: string, code = 500) {
    super(`${message}`, code, "UserService");
  }
}

export default class UserService {
  constructor(protected userRepository: UserRepository) {}

  private validateData(data: Partial<User>, allData = false): void {
    const { email, password, name } = data;

    // Is this necessary?
    // @TODO Verify if this is necessary
    if (allData || email !== undefined) {
      if (typeof email !== "string") {
        throw new UserServiceError("Invalid email", 422);
      }
    }

    if (allData || password !== undefined) {
      if (typeof password !== "string") {
        throw new UserServiceError("Invalid password", 422);
      }
    }

    if (allData || name !== undefined) {
      if (name && typeof name !== "string") {
        throw new UserServiceError("Invalid name", 422);
      }
    }
  }

  /**
   * Create a new user
   * @param data
   * @returns
   */
  public async create(
    data: Partial<User>,
    ip?: string
  ): Promise<{
    name?: string;
    token: GeneratedJWTInterface;
    user_id: string;
  }> {
    this.validateData(data, true);

    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    const tokenAndName = await this.authenticate(data.email, data.password, ip);

    return { ...tokenAndName, user_id: user.id };
  }

  /**
   * Authenticate user
   * @param email
   * @param password
   * @returns
   */
  public async authenticate(
    email?: string,
    password?: string,
    ip?: string
  ): Promise<{
    name?: string;
    token: GeneratedJWTInterface;
  }> {
    if (!email || !password)
      throw new UserServiceError("Email and password are required", 422);

    this.validateData({ email, password });

    const user = await this.userRepository.comparePassword(email, password);

    if (!user) throw new UserServiceError("Invalid password", 401);

    const jwt = AuthService.generateJWT({
      id: user.id,
    });

    await this.userRepository.addJWTs(user.id, jwt, ip || "");

    return { name: user.name, token: jwt };
  }
}
