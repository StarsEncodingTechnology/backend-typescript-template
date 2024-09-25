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
  // password tests
  describe("Password methods", () => {
    describe("hash password - hashPassword", () => {
      it("Should generate a hash from a password", async () => {
        const password = "1234";
        const hash = await AuthService.hashPassword(password);
        expect(hash).not.toHaveLength(0);
      });

      it("Should generate a hash different from the password", async () => {
        const password = "1234";
        const hash = await AuthService.hashPassword(password);
        expect(hash).not.toBe(password);
      });
    });

    describe("compare password - comparePassword", () => {
      it("Should compare and match the password and the hash", async () => {
        const password = "1234";
        const hash = await AuthService.hashPassword(password);
        const isPassword = await AuthService.comparePassword(password, hash);

        expect(isPassword).toBeTruthy();
      });

      it("Should compare and not match the password and the hash", async () => {
        const password = "1234";
        const hash = await AuthService.hashPassword(password);
        const isPassword = await AuthService.comparePassword("12345", hash);

        expect(isPassword).toBeFalsy();
      });
    });
  });

  //-------------------------------------------------
  // JWT tests
  describe("JWT methods", () => {
    describe("Should generate a JWT - generateJWT", () => {
      it("Should generate a JWT", () => {
        const payload = { id: "1234" };

        const { jwt } = AuthService.generateJWT(payload);

        expect(jwt).not.toHaveLength(0);
      });

      it("Should generate a JWT with custom expiration time", () => {
        const payload = { id: "1234" };
        const { jwt, expiresIn } = AuthService.generateJWT(
          payload,
          undefined,
          "1h"
        );

        expect(jwt).not.toHaveLength(0);
        expect(expiresIn).toBeInstanceOf(Date);
      });
    });

    describe("Should decode a JWT - decodeJWT", () => {
      it("Should decode a JWT", async () => {
        const payload = { id: "1234" };

        userRepository.findOne = jest.fn().mockResolvedValue({
          JWTs: [],
          toJSON: jest.fn().mockReturnValue({ id: "1234" }),
          id: "1234",
        });

        const { jwt } = AuthService.generateJWT(payload);
        const decoded = await AuthService.decodeJWT(
          jwt,
          "",
          undefined,
          userRepository
        );

        expect(decoded).toEqual({ userDecoded: { ...payload }, ip: "257" });
      });

      it("Should return an error when JWT is not in the DB", async () => {
        const payload = { id: "1234" };

        userRepository.findOne = jest.fn().mockResolvedValue(undefined);

        const { jwt } = AuthService.generateJWT(payload);

        await expect(AuthService.decodeJWT(jwt, "")).rejects.toThrow(
          "Invalid JWT"
        );
      });

      it("Should return an error for an invalid JWT", async () => {
        userRepository.findOne = jest.fn().mockResolvedValue({
          JWTs: [],
          toJSON: jest.fn().mockResolvedValue({ id: "1234" }),
          id: "1234",
        });

        await expect(
          AuthService.decodeJWT("123", "", undefined, userRepository)
        ).rejects.toThrow("jwt malformed");
      });
    });

    describe("validateJWT", () => {
      it("Should validate a valid JWT", () => {
        const payload = { id: "1234" };
        const { jwt } = AuthService.generateJWT(payload);

        const isValid = AuthService.validateJWT(jwt);

        expect(isValid).toBeTruthy();
      });

      it("Should return an error for an invalid JWT", () => {
        expect(() => AuthService.validateJWT("invalid.jwt.token")).toThrow(
          "invalid token"
        );
      });
    });
  });

  //-------------------------------------------------
  // 6-digit token tests
  describe("6-digit token", () => {
    describe("generate6DigitToken", () => {
      it("Should generate a 6-digit token", () => {
        const { token, expiresIn } = AuthService.generate6DigitToken();

        expect(token).toHaveLength(6);
        expect(expiresIn).toBeInstanceOf(Date);
      });

      it("Should generate a different 6-digit token each time", () => {
        const token1 = AuthService.generate6DigitToken().token;
        const token2 = AuthService.generate6DigitToken().token;

        expect(token1).not.toBe(token2);
      });
    });
  });
});
