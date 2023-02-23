"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
(async () => {
    const server = new server_1.SetupServer();
    await server.init();
    server.start();
})();
//# sourceMappingURL=index.js.map