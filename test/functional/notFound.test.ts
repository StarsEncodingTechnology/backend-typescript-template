// Faz o teste em todas as rotas inexistentes
describe("Not Found", () => {
  it("get", async () => {
    const response = await global.testRequest.get("/v1/invalid-path");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 404,
      error: "Not Found",
    });
  });

  it("post", async () => {
    const response = await global.testRequest.post("/v1/invalid-path");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 404,
      error: "Not Found",
    });
  });

  it("put", async () => {
    const response = await global.testRequest.put("/v1/invalid-path");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 404,
      error: "Not Found",
    });
  });

  it("patch", async () => {
    const response = await global.testRequest.patch("/v1/invalid-path");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 404,
      error: "Not Found",
    });
  });

  it("delete", async () => {
    const response = await global.testRequest.delete("/v1/invalid-path");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 404,
      error: "Not Found",
    });
  });
});