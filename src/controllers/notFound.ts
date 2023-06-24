import {
  Controller,
  Delete,
  Get,
  Middleware,
  Patch,
  Post,
  Put,
} from "@overnightjs/core";
import { Request, Response } from "express";
import ApiError from "@src/util/errors/api-error";
import rateLimit from "express-rate-limit";

/**
 * limitador de requisições inexistentes
 */
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: Number(process.env.RATELIMITWINDOW_DEFALUT as string),
  keyGenerator(req: Request): string {
    return req.ip;
  },
  message:
    "Muitas tentativas em uma rota inexiste, tente novamente em 1 minuto",
  handler: (_, response, __, option) => {
    response
      .status(429)
      .send(ApiError.format({ code: 429, error: option.message }));
  },
});

/**
 * Faz o controle de rotas inexistentes
 */
@Controller("*")
export class NotFoundController {
  @Get()
  @Post()
  @Put()
  @Patch()
  @Delete()
  @Middleware(limiter)
  public NotFound(_: Request, res: Response): void {
    res.status(404).send(ApiError.format({ code: 404, error: "Not Found" }));
  }
}
