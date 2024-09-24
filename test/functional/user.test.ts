import { UserMongoDBRepository } from "@src/repositories/uso/userMongoDBRepository";

describe("Teste funcionais Rota User", () => {
  const userRepository = new UserMongoDBRepository();

  const newUser = {
    name: "Pedro Teste",
    email: "star@encodingstars.com",
    password: "teste",
  };

  beforeEach(async () => {
    await userRepository.deleteMany({});
  });

  afterAll(async () => {
    await userRepository.deleteMany({});
  });

  describe("Teste rota user", () => {
    it("Deve criar o usuario", async () => {
      const { status, body } = await global.testRequest
        .post("/user")
        .send(newUser);

      expect(body).toMatchObject({
        code: 201,
        message: `Created`,
        data: {
          name: newUser.name,
          token: {
            expiraEm: expect.any(String),
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

    it("deve retornar um erro 422 quando faltar alguma informação", async () => {
      const user = {
        email: "star@encodingstars.com",
        password: "teste",
        CNPJ: "33455256000142",
      };

      const { status, body } = await global.testRequest
        .post("/user")
        .send(user);

      expect(status).toBe(422);
      expect(body).toEqual({
        code: 422,
        error: "User validation failed: nome: Path `nome` is required.",
      });
    });

    it("deve retornar um erro caso o email já exista", async () => {
      await global.testRequest
        .post("/user")
        .send({ ...newUser, ...{ CNPJ: "87544266000183" } });

      const { status, body } = await global.testRequest
        .post("/user")
        .send(newUser);

      expect(status).toBe(409);
      expect(body).toEqual({
        code: 409,
        error: "User validation failed: email: Email já cadastrado.",
      });
    });

    it("deve retornar um error caso o CNPJ não seja valido", async () => {
      const user = { ...newUser, ...{ CNPJ: "12123123000113" } };

      const { status, body } = await global.testRequest
        .post("/user")
        .send(user);

      expect(status).toBe(status);
      expect(body).toEqual({
        code: 409,
        error: "User validation failed: CNPJ: CNPJ Invalido.",
      });
    });

    it("deve retornar um erro caso o CNPJ já esteja cadastrado", async () => {
      await global.testRequest
        .post("/user")
        .send({ ...newUser, ...{ email: "email@teste" } });

      const { status, body } = await global.testRequest
        .post("/user")
        .send(newUser);

      expect(status).toBe(409);
      expect(body).toEqual({
        code: 409,
        error: "User validation failed: CNPJ: CNPJ já cadastrado.",
      });
    });

    // describe.skip("Rotas de user alteração", () => {});
  });

  // describe("teste rota de autenticação", () => {
  //   it("deve retornar o token valido", async () => {
  //     await new User(newUser).save();

  //     const { body } = await global.testRequest
  //       .post("/user/authenticate")
  //       .send({
  //         email: newUser.email,
  //         password: newUser.password,
  //       });

  //     expect(body).toEqual(
  //       expect.objectContaining({ token: expect.any(String) })
  //     );
  //   });

  //   it("deve retornar não autorizado caso a senha não bater", async () => {
  //     await new User(newUser).save();

  //     const { status } = await global.testRequest
  //       .post("/user/authenticate")
  //       .send({
  //         email: newUser.email,
  //         password: "NAOECORRETA",
  //       });

  //     expect(status).toBe(401);
  //   });

  //   it("deve retornar caso o email não seja encontrado", async () => {
  //     const { status, body } = await global.testRequest
  //       .post("/user/authenticate")
  //       .send({
  //         email: "email@email.com",
  //         password: "LOCURA",
  //       });

  //     expect(status).toBe(401);
  //     expect(body).toEqual({
  //       code: 401,
  //       error: "Usuário não encontrado.",
  //     });
  //   });

  //   it("deve retornar error se token não for valido", async () => {
  //     const { status, body } = await global.testRequest.get(
  //       "/user/authenticate/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZTRiNTgyMzQ1YWFlY2M4MzFlOTZlYjliOWZkMWE0Yjg6ODVmYTM5YWEzZThlMTMyMGY4OGYzY2M4NDZkNzY5OTk3MDI3M2NjNzZmYTRlNDIwYTU0NGUzNjUwYjIxN2VjZTVjNWMzNDc5YTU3OTJkOTRjY2Q1MDA5NDZkMmRjNTE5YmEyNjc3MGU4OGVjZWZhMTEyZjNjYTMxODBjMWYxMjMzMDEwNTRlNjNjMzRlMjJlMGFhNTQyNWViZmJiMzM1YSIsImlhdCI6MTY2Njk3OTc5MiwiZXhwIjoxNjY2OTg2OTkyfQ.KEc5kGOHzm4R86Q1wlTK0Hm_NILeAmndXsnk1SwA376LHklowsY9qFsdNiwX7gci3aF2xrrl8hWR0X_kenJBChQt3tPpSbP1hjPpNtNZ47Y6S8b7CwhNCN6vzbgt5Cw5WgGReKoudZyC4z8rI9xqzodJOVXo1VGmIDkAJj_Lupz2E7TD-MHNh2vQVOyDJIp4zqgDiH2QYfM0t2yW36YjmFGMfv8KCN6UbSCCcbAHaNdW1QdOmNF_vl0b5bV7I_7n_loDE_6iFoZkHU-vIAFbg7UKuZAE0k7e6WJXSr5mWBuF9jf2YkLZb6EQBiy7TwqDqfW4bqACs3wvLHvhsPGwqA"
  //     );

  //     expect(status).toBe(401);
  //     expect(body).toEqual({ code: 401, error: "invalid algorithm" });
  //   });

  //   it("deve retornar valido se token for valido", async () => {
  //     const user = await new User(newUser).save();
  //     const jwt = AuthService.gerarJWT({
  //       id: user.id,
  //     });

  //     const { status, body } = await global.testRequest.get(
  //       `/user/authenticate/${jwt}`
  //     );

  //     expect(status).toBe(200);
  //     expect(body).toEqual({ apelido: newUser.name, token: jwt });
  //   });
  // });
});
