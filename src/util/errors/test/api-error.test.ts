import ApiError from "../api-error";

describe("ApiError", () => {
  it("Deve retornar 404", () => {
    const error = ApiError.format({ code: 404, error: "User not found!" });
    expect(error).toEqual({
      error: "User not found!",
      code: 404,
    });
  });
  it("Deve retornar 404 com descrição", () => {
    const error = ApiError.format({
      code: 404,
      error: "User not found!",
      description: "This error happens when there is no user created",
    });
    expect(error).toEqual({
      error: "User not found!",

      code: 404,
      description: "This error happens when there is no user created",
    });
  });
  it("Deve retornar 404 com descrição e documentação", () => {
    const error = ApiError.format({
      code: 404,
      error: "User not found!",
      description: "This error happens when there is no user created",
      documentation: "https://mydocs.com/error-404",
    });
    expect(error).toEqual({
      error: "User not found!",
      code: 404,
      description: "This error happens when there is no user created",
      documentation: "https://mydocs.com/error-404",
    });
  });
});
