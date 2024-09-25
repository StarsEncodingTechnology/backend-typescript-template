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
import { apiErrorValidator } from "./middlewares/apiErrorValidator";
import { LogErrorDBRepository } from "./repositories/uso/logErrorDBRepository";
import { UserMongoDBRepository } from "./repositories/uso/userMongoDBRepository";
import LogErrorService from "./services/logErrorService";
import UserService from "./services/userService";

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  /**
   * Initializes the server
   */
  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.dataBaseSetup();
    // lastly
    this.setupErrorHandlers();
  }

  /**
   * Configures express
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
    const repositories = this.setupRepository();

    const userService = new UserService(repositories.userRepository);
    const errorService = new LogErrorService(repositories.errorRepository);

    return {
      services: {
        userService,
        errorService,
      },
      repositories,
    };
  }

  private setupControllers(): void {
    const { services, repositories } = this.setupRepositoryServices();

    const userController = new UserControllers(
      services.userService,
      repositories.userRepository,
      services.errorService
    );

    const arrayController = [userController];

    this.addControllers([
      ...arrayController,
      new NotFoundController(services.errorService),
    ]);
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  public async dataBaseSetup(): Promise<void> {
    await database.connect();
  }

  /**
   * Starts the app
   */
  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server started on ${this.port}`);
    });
  }

  /**
   * Captures and returns the current app configuration
   * @returns the express application
   */
  get getApp() {
    return this.app;
  }

  public async close(): Promise<void> {
    await database.close();
  }
}
