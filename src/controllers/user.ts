import { Controller, Get, Post } from "@overnightjs/core";
import { BaseController } from ".";
import { Request, Response } from "express";
import { User } from "@src/model/user";
import { AuthService } from "@src/services/authService";
import ApiError from "@src/util/errors/api-error";

@Controller("user")
export class UserControllers extends BaseController {
  /**
   * Faz a criação de um novo usuario
   */
  @Post("")
  public async criarUser(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).send({ code: 201, message: "Criado" });
    } catch (e) {
      this.enviaErrorResponse(res, e);
    }
  }

  /*
   * Gera token JWT
   */
  @Post("authenticate")
  public async gerarJWT(
    req: Request,
    res: Response
  ): Promise<Response | undefined> {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });

      /*
       Abaixo ele testa se usuario existe e se a senha envia pela
       rota bate com a guardada no banco
       */
      if (!user)
        return res
          .status(401)
          .send(
            ApiError.format({ code: 401, error: "Usuário não encontrado." })
          );
      else if (!(await AuthService.comparaPassword(password, user.password)))
        return res
          .status(401)
          .send(ApiError.format({ code: 401, error: "Senha inválido" }));

      /* 
        gera um JWT
      */
      const jwt = AuthService.gerarJWT({
        id: user.id,
      });

      return res.status(200).send({ apelido: user.nome, token: jwt });
    } catch (e) {
      this.enviaErrorResponse(res, e);
      return;
    }
  }

  @Get("authenticate")
  public async rotaVazia(_: Request, res: Response): Promise<void> {
    res.status(404).send(
      ApiError.format({
        code: 404,
        error:
          "esssa rota precisa do parametro jwt, exemplo: user/authenticate/:jwt",
      })
    );
  }
  /*
   * faz o teste no JWT passado como parametro
   */
  @Get("authenticate/:jwt")
  public async validarJWT(
    req: Request,
    res: Response
  ): Promise<void | Response> {
    const jwt = req.params.jwt;

    try {
      const decodado = AuthService.decodarJWT(jwt);

      const user = await User.findById(decodado.id);

      if (!user)
        return res.status(401).send(
          ApiError.format({
            code: 400,
            error: "Não autorizado, user não localizado",
          })
        );

      res.status(200).send({ apelido: user.nome, token: jwt });
    } catch (e) {
      res
        .status?.(401)
        .send(ApiError.format({ code: 401, error: (e as Error).message }));
    }
  }
}
