import { Request, Response, NextFunction } from "express";
import { AuthService } from "@src/services/authService";
import ApiError from "@src/util/errors/api-error";

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  const token = req.headers?.["x-acess-token"];
  try {
    const decoded = AuthService.decodarJWT(token as string);
    req.decoded = decoded;

    next("");
  } catch (error) {
    //@TODO logar isso aqui
    res.status?.(401).send(
      ApiError.format({
        code: 401,
        error: (error as Error).message,
      })
    );
  }
}
