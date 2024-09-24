import ResponseDefault from "@src/util/responseDefault";

// Faz o teste em todas as rotas inexistentes
describe("Not Found", () => {
  it("get", async () => {
    const response = await global.testRequest.get("/v1/invalid-path");
    expect(response.status).toBe(404);

    expect(ResponseDefault.isResponseDefault(response.body)).toBeTruthy();
  });

  it("post", async () => {
    const response = await global.testRequest.post("/v1/invalid-path");
    expect(response.status).toBe(404);

    expect(ResponseDefault.isResponseDefault(response.body)).toBeTruthy();
  });

  it("put", async () => {
    const response = await global.testRequest.put("/v1/invalid-path");
    expect(response.status).toBe(404);

    expect(ResponseDefault.isResponseDefault(response.body)).toBeTruthy();
  });

  it("patch", async () => {
    const response = await global.testRequest.patch("/v1/invalid-path");
    expect(response.status).toBe(404);

    expect(ResponseDefault.isResponseDefault(response.body)).toBeTruthy();
  });

  it("delete", async () => {
    const response = await global.testRequest.delete("/v1/invalid-path");
    expect(response.status).toBe(404);

    expect(ResponseDefault.isResponseDefault(response.body)).toBeTruthy();
  });

  // it.only("Handler Error", async () => {
  // @TODO - Verificar como fazer o teste de erro
  //   const response = await global.testRequest
  //     .post("/user/")
  //     .send({ a: undefined });
  //   expect(response.body).toEqual({
  //     code: 400,
  //     error: "Unexpected end of JSON input",
  //   });
  //   expect(response.status).toBe(400);
  // });
});
