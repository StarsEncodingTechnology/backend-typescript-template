import { AuthService, AuthServiceDecodeError } from "@src/services/authService";
import ResponseDefault from "@src/util/responseDefault";
import { NextFunction, Request, Response } from "express";

/**
 * Middleware function to handle authentication.
 *
 * @param {Partial<Request>} req - The request object, partially typed.
 * @param {Partial<Response>} res - The response object, partially typed.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {Error} - Throws an error if the IP is invalid or if token decoding fails.
 *
 * The middleware performs the following tasks:
 * 1. Extracts the token from the request headers.
 * 2. Decodes the token using the AuthService.
 * 3. Checks if the IP address matches the decoded IP (if IP checking is enabled).
 * 4. Attaches the decoded user information to the request object.
 * 5. Calls the next middleware function in the stack.
 *
 * If an error occurs during token decoding or IP validation, it constructs an error response
 * and sends it back to the client with the appropriate status code.
 */
export async function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): Promise<void> {
  const token = req.headers?.["x-access-token"];
  try {
    const decoded = await AuthService.decodeJWT(token as string, req.url || "");

    if (process.env.CHECKIP == "true" && decoded.ip !== req.ip)
      throw new Error("Invalid IP");

    req.decoded = decoded.userDecoded;

    next("");
  } catch (error) {
    const errorObj =
      error instanceof AuthServiceDecodeError
        ? {
            classError: error.classError,
            description: error.description,
          }
        : {
            classError: "AuthClass",
            description: `AuthClass: ${(error as Error).message}`,
          };

    const code = error instanceof AuthServiceDecodeError ? error.code : 401;

    const responseData = new ResponseDefault({
      code: code,
      message: (error as Error).message,
      url: `${`${req.protocol}://${(req as Request).get("host")}${
        req.originalUrl
      }`}`,
      method: req.method || "",
      error: errorObj,
    });

    res.status?.(code).send(responseData.responseData);
  }
}
