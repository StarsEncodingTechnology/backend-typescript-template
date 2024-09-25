import { LogErrorDBRepository } from "@src/repositories/uso/logErrorDBRepository";
import { UserMongoDBRepository } from "@src/repositories/uso/userMongoDBRepository";
import UserService from "@src/services/userService";

describe("Functional Tests for User Route", () => {
  const userRepository = new UserMongoDBRepository();
  const errorRepository = new LogErrorDBRepository();

  const newUser = {
    name: "Pedro Test",
    email: "star@encodingstars.com",
    password: "test",
  };

  beforeEach(async () => {
    await userRepository.deleteMany({});
    await errorRepository.deleteMany({});
  });

  // POST /user
  describe("User route tests", () => {
    it("Should create the user", async () => {
      const { status, body } = await global.testRequest
        .post("/user")
        .send(newUser);

      expect(body).toMatchObject({
        code: 201,
        message: `Created`,
        data: {
          name: newUser.name,
          token: {
            expiresIn: expect.any(String),
            jwt: expect.any(String),
          },
          user_id: expect.any(String),
        },
      });

      expect(status).toBe(201);

      const user = await userRepository.findById(body.data.user_id);

      expect(user).toMatchObject({
        name: newUser.name,
        email: newUser.email,
      });
    });

    it("Should return a 422 error when some information is missing", async () => {
      const user = {
        password: "test",
      };

      const { status, body } = await global.testRequest
        .post("/user")
        .send(user);

      expect(body).toMatchObject({
        code: 422,
        message: "Invalid email",
        error: {
          classError: `UserService`,
          description: `UserService: Invalid email`,
        },
      });

      expect(status).toBe(422);
    });

    it("Should return an error if the email already exists", async () => {
      await global.testRequest.post("/user").send({ ...newUser });

      const { status, body } = await global.testRequest
        .post("/user")
        .send(newUser);

      expect(body).toMatchObject({
        code: 409,
        message:
          "Duplicate value: User validation failed: email: Email already registered.",
        error: {
          classError: `DatabaseValidationError`,
          description: `Duplicate value: User validation failed: email: Email already registered.`,
        },
      });

      expect(status).toBe(409);
    });
  });

  // POST /user/authenticate
  describe("Authentication route tests /user/authenticate", () => {
    it("Should successfully authenticate the user", async () => {
      await userRepository.create({ ...newUser });

      const { status, body } = await global.testRequest
        .post("/user/authenticate")
        .send({
          email: newUser.email,
          password: newUser.password,
        });

      expect(body).toMatchObject({
        code: 200,
        message: "Authenticate",
        data: {
          token: {
            expiresIn: expect.any(String),
            jwt: expect.any(String),
          },
        },
        url: expect.stringContaining("/user/authenticate"),
        method: "POST",
      });

      expect(status).toBe(200);

      const dbUsers = await userRepository.find({});

      expect(dbUsers).toHaveLength(1);
      expect(dbUsers[0].name).toBe(newUser.name);
      expect(dbUsers[0].JWTs).toHaveLength(1);
    });

    it("Should return 401 when the password is incorrect", async () => {
      await userRepository.create({ ...newUser });

      const { status, body } = await global.testRequest
        .post("/user/authenticate")
        .send({
          email: newUser.email,
          password: "StrongPassword26948#",
        });

      expect(body).toMatchObject({
        code: 401,
        message: "Invalid password",
        method: "POST",
        url: expect.stringContaining("/user/authenticate"),
      });
      expect(status).toBe(401);
    });

    it("Should return 401 error when no user is found", async () => {
      const { status, body } = await global.testRequest
        .post("/user/authenticate")
        .send({
          email: newUser.email,
          password: newUser.password,
        });

      expect(body).toMatchObject({
        code: 401,
        message: "Invalid password",
        method: "POST",
        url: expect.stringContaining("/user/authenticate"),
      });
      expect(status).toBe(401);
    });
  });

  // GET /user/authenticate/
  describe("GET /user/authenticate/", () => {
    it(`Should return 200 when the user is authenticated`, async () => {
      const userService = new UserService(userRepository);

      const { token } = await userService.create({ ...newUser }, "1");

      const { status, body } = await global.testRequest
        .get("/user/authenticate/")
        .set({
          "x-access-token": token.jwt,
        });

      console.log(body.data);
      expect(body).toMatchObject({
        code: 200,
        message: "Valid JWT",
        data: {
          name: newUser.name,
        },
      });

      expect(status).toBe(200);
    });
  });
});
