import {
  Controller,
  Delete,
  Get,
  Middleware,
  Patch,
  Post,
  Put,
} from "@overnightjs/core";
import { InternalError } from "@src/util/errors/internal-error";
import RateLimitCreator from "@src/util/rateLimitDefault";
import { Request, Response } from "express";
import { BaseController } from ".";

/**
 * limitador de requisições inexistentes
 */
const limiter = RateLimitCreator(1, "Router not found", 100);

/**
 * Faz o controle de rotas inexistentes
 */
@Controller("*")
export class NotFoundController extends BaseController {
  @Get()
  @Post()
  @Put()
  @Patch()
  @Delete()
  @Middleware(limiter)
  public async NotFound(req: Request, res: Response): Promise<void> {
    await this.apiError(
      req,
      res,
      new InternalError(`Router not found: ${req.url}`, 404)
    );
  }
}
