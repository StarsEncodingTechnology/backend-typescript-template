import * as dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

import { Server } from "@overnightjs/core";
import * as database from "@src/database";
import cors from "cors";
import { json } from "express";
import expressPino from "express-pino-logger";
import { NotFoundController } from "./controllers/notFound";
import { UserControllers } from "./controllers/user";
import logger from "./logger";
import { apiErrorValidador } from "./middlewares/apiErrorValidador";
import { LogErrorDBRepository } from "./repositories/uso/logErrorDBRepository";
import { UserMongoDBRepository } from "./repositories/uso/userMongoDBRepository";
import LogErrorService from "./services/logErrorService";
import UserService from "./services/userService";

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  /**
   * Faz a iniciação do servidor
   */
  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.dataBaseSetup();
    // por ultimo
    this.setupErrorHandlers();
  }

  /**
   * Faz a configuração do express
   */
  public setupExpress(): void {
    this.app.use(json());
    this.app.use(expressPino({ logger }));
    this.app.use(cors({ origin: "*" }));
  }

  private setupRepository() {
    const userRepository = new UserMongoDBRepository();
    const errorRepository = new LogErrorDBRepository();

    return { userRepository, errorRepository };
  }

  /**
   * Sets up the services with the provided repositories.
   * */
  private setupRepositoryServices() {
    const repositorys = this.setupRepository();

    const userService = new UserService(repositorys.userRepository);
    const errorService = new LogErrorService(repositorys.errorRepository);

    return {
      services: {
        userService,
        errorService,
      },
      repositorys,
    };
  }

  private setupControllers(): void {
    const { services, repositorys } = this.setupRepositoryServices();

    const userController = new UserControllers(
      services.userService,
      repositorys.userRepository,
      services.errorService
    );

    const arrayController = [userController];

    this.addControllers([
      ...arrayController,
      new NotFoundController(services.errorService),
    ]);
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidador);
  }

  public async dataBaseSetup(): Promise<void> {
    await database.connect();
  }

  /**
   * Faz o listen do app
   */
  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server iniciado em ${this.port}`);
    });
  }
  /**
   * Faz a captura e retorar a configuração atual do app
   * @returns o aplication do express
   */
  get getApp() {
    return this.app;
  }

  public async close(): Promise<void> {
    await database.close();
  }
}
