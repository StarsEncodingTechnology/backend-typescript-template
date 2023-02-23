"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.connect = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = __importDefault(require("./logger"));
(0, mongoose_1.set)("strictQuery", true);
const connect = async (urlDB = process.env.MONGOURL) => {
    await (0, mongoose_1.connect)(urlDB);
    if (process.env.NODE_ENV != "test")
        logger_1.default.info("Conectado ao banco");
};
exports.connect = connect;
const close = () => mongoose_1.connection.close();
exports.close = close;
//# sourceMappingURL=database.js.map