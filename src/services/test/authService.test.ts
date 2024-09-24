import { UserMongoDBRepository } from "@src/repositories/uso/userMongoDBRepository";
import { AuthService } from "@src/services/authService";

jest.mock("@src/repositories/uso/userMongoDBRepository.ts");

describe("authService", () => {
  const userRepository =
    new UserMongoDBRepository() as jest.Mocked<UserMongoDBRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  //-------------------------------------------------
  // teste de senhas
  describe("Password publics", () => {
    describe("hash password - hashPassword", () => {
      it("Deve gerar um hash a partir de uma senha", async () => {
        const senha = "1234";
        const hash = await AuthService.hashPassword(senha);
        expect(hash).not.toHaveLength(0);
      });

      it("Deve gerar um hash diferente da senha", async () => {
        const senha = "1234";
        const hash = await AuthService.hashPassword(senha);
        expect(hash).not.toBe(senha);
      });
    });

    describe("compara password - comparaPassword", () => {
      it("Deve comparar e bater a senha e o hash", async () => {
        const senha = "1234";
        const hash = await AuthService.hashPassword(senha);
        const isPassword = await AuthService.comparaPassword(senha, hash);

        expect(isPassword).toBeTruthy();
      });

      it("Deve comparar e não bater a senha e o hash", async () => {
        const senha = "1234";
        const hash = await AuthService.hashPassword(senha);
        const isPassword = await AuthService.comparaPassword("12345", hash);

        expect(isPassword).toBeFalsy();
      });
    });
  });

  //-------------------------------------------------
  // teste de JWT
  describe("JWT publics", () => {
    describe("Devem gerar um JWT - gerarJWT", () => {
      it("Deve gerar um JWT", () => {
        const payload = { id: "1234" };

        const { jwt } = AuthService.gerarJWT(payload);

        expect(jwt).not.toHaveLength(0);
      });

      it("Deve gerar um JWT com tempo de expiração customizado", () => {
        const payload = { id: "1234" };
        const { jwt, expiraEm } = AuthService.gerarJWT(
          payload,
          undefined,
          "1h"
        );

        expect(jwt).not.toHaveLength(0);
        expect(expiraEm).toBeInstanceOf(Date);
      });
    });

    describe("Devem decodar um JWT - decodarJWT", () => {
      it("Deve decodar um JWT", async () => {
        const payload = { id: "1234" };

        userRepository.findOne = jest.fn().mockResolvedValue({
          JWTs: [],
          toJSON: jest.fn().mockReturnValue({ id: "1234" }),
          id: "1234",
        });

        const { jwt } = AuthService.gerarJWT(payload);
        const decodar = await AuthService.decodarJWT(
          jwt,
          "",
          undefined,
          userRepository
        );

        expect(decodar).toEqual({ userDecoded: { ...payload }, ip: "257" });
      });

      it("Deve retornar um erro quando JWT não estiver no DB", async () => {
        const payload = { id: "1234" };

        userRepository.findOne = jest.fn().mockResolvedValue(undefined);

        const { jwt } = AuthService.gerarJWT(payload);

        await expect(AuthService.decodarJWT(jwt, "")).rejects.toThrow(
          "JWT invalido"
        );
      });

      it("Deve retornar um erro quando JWT invalido", async () => {
        userRepository.findOne = jest.fn().mockResolvedValue({
          JWTs: [],
          toJSON: jest.fn().mockResolvedValue({ id: "1234" }),
          id: "1234",
        });

        await expect(
          AuthService.decodarJWT("123", "", undefined, userRepository)
        ).rejects.toThrow("jwt malformed");
      });
    });

    describe("validaJWT", () => {
      it("Deve validar um JWT válido", () => {
        const payload = { id: "1234" };
        const { jwt } = AuthService.gerarJWT(payload);

        const isValid = AuthService.validaJWT(jwt);

        expect(isValid).toBeTruthy();
      });

      it("Deve retornar um erro para JWT inválido", () => {
        expect(() => AuthService.validaJWT("invalid.jwt.token")).toThrow(
          "invalid token"
        );
      });
    });
  });

  //-------------------------------------------------
  // teste de Token de 6 dígitos
  describe("Token de 6 dígitos", () => {
    describe("gerarTokenDe6Digitos", () => {
      it("Deve gerar um token de 6 dígitos", () => {
        const { token, expiraEm } = AuthService.gerarTokenDe6Digitos();

        expect(token).toHaveLength(6);
        expect(expiraEm).toBeInstanceOf(Date);
      });

      it("Deve gerar um token de 6 dígitos diferente a cada chamada", () => {
        const token1 = AuthService.gerarTokenDe6Digitos().token;
        const token2 = AuthService.gerarTokenDe6Digitos().token;

        expect(token1).not.toBe(token2);
      });
    });
  });
});
