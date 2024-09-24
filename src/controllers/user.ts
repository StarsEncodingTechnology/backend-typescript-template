import {
  ClassMiddleware,
  Controller,
  Get,
  Middleware,
  Post,
} from "@overnightjs/core";
import { authMiddleware } from "@src/middlewares/auth";
import { UserRepository } from "@src/repositories";
import LogErrorService from "@src/services/logErrorService";
import UserService from "@src/services/userService";
import RateLimitCreator from "@src/util/rateLimitDefault";
import { Request, Response } from "express";
import { BaseController } from ".";

const limit = RateLimitCreator(1, `So many try, try more later`, 100);

@Controller("user")
@ClassMiddleware(limit)
export class UserControllers extends BaseController {
  constructor(
    protected userService: UserService,
    protected userRepository: UserRepository,
    logErrorService: LogErrorService
  ) {
    super(logErrorService);
  }

  /**
   * Faz a criação de um novo usuario
   */
  @Post("")
  public async criarUser(req: Request, res: Response): Promise<void> {
    try {
      const tokenCreate = await this.userService.create(req.body, req.ip);

      this.apiResponse({
        req,
        res,
        code: 201,
        message: "Created",
        data: tokenCreate,
      });
    } catch (e) {
      this.apiError(req, res, e);
    }
  }

  /*
   * Gera token JWT
   */
  @Post("authenticate")
  public async gerarJWT(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const responseAuth = await this.userService.autenticate(
        email,
        password,
        req.ip
      );

      this.apiResponse({
        req,
        res,
        code: 200,
        message: "Authenticate",
        data: responseAuth,
      });
    } catch (e) {
      this.apiError(req, res, e);
      return;
    }
  }

  /*
   * faz o teste no JWT passado como parametro
   */
  @Get("authenticate/:jwt")
  @Middleware(authMiddleware)
  public async validarJWT(
    req: Request,
    res: Response
  ): Promise<void | Response> {
    try {
      const userDecoded = req.decoded;

      this.apiResponse({
        req,
        res,
        code: 200,
        message: "Valid JWT",
        data: userDecoded,
      });
    } catch (error) {
      this.apiError(req, res, error);
    }
  }
}
