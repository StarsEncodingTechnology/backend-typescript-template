"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupServer = void 0;
require("./util/module-alias");
const dotenv = __importStar(require("dotenv"));
dotenv.config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});
const core_1 = require("@overnightjs/core");
const express_1 = require("express");
const cors_1 = __importDefault(require("cors"));
const express_pino_logger_1 = __importDefault(require("express-pino-logger"));
const logger_1 = __importDefault(require("./logger"));
const database = __importStar(require("@src/database"));
class SetupServer extends core_1.Server {
    port;
    constructor(port = 3000) {
        super();
        this.port = port;
    }
    async init() {
        this.setupExpress();
        this.setupControllers();
        await this.dataBaseSetup();
    }
    setupExpress() {
        this.app.use((0, express_1.json)());
        this.app.use((0, express_pino_logger_1.default)({ logger: logger_1.default }));
        this.app.use((0, cors_1.default)({ origin: "*" }));
    }
    setupControllers() { }
    async dataBaseSetup() {
        await database.connect();
    }
    start() {
        this.app.listen(this.port, () => {
            logger_1.default.info(`Server iniciado em ${this.port}`);
        });
    }
    get getApp() {
        return this.app;
    }
}
exports.SetupServer = SetupServer;
//# sourceMappingURL=server.js.map