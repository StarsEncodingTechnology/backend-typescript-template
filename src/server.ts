import "./util/module-alias";

import * as dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

import { Server } from "@overnightjs/core";
import { json } from "express";
import cors from "cors";
import { Application } from "express-serve-static-core";
import expressPino from "express-pino-logger";
import logger from "./logger";
import * as database from "@src/database";
import { UserControllers } from "./controllers/user";
import { apiErrorValidador } from "./middlewares/apiErrorValidador";

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

  public setupControllers(): void {
    const userController = new UserControllers();
    this.addControllers(userController);
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
  get getApp(): Application {
    return this.app;
  }

  public async close(): Promise<void> {
    await database.close();
  }
}
