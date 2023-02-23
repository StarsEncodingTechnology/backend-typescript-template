"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@src/server");
const supertest_1 = __importDefault(require("supertest"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});
let server;
beforeAll(async () => {
    server = new server_1.SetupServer();
    await server.init();
    global.testRequest = (0, supertest_1.default)(server.getApp);
});
//# sourceMappingURL=jest-setup.js.map