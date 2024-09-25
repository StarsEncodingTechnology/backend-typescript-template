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
 * Rate limiter for non-existent requests
 */
const rateLimiter = RateLimitCreator(1, "Route not found", 100);

/**
 * Handles non-existent routes
 */
@Controller("*")
export class NotFoundController extends BaseController {
  @Get()
  @Post()
  @Put()
  @Patch()
  @Delete()
  @Middleware(rateLimiter)
  public async routeNotFound(req: Request, res: Response): Promise<void> {
    await this.apiError(
      req,
      res,
      new InternalError(`Route not found: ${req.url}`, 404)
    );
  }
}
