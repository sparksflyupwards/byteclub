"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("@remix-run/express");
var compression_1 = require("compression");
var express_2 = require("express");
var morgan_1 = require("morgan");
var dotenv_1 = require("dotenv");
var viteDevServer = process.env.NODE_ENV === "production"
    ? undefined
    : await Promise.resolve().then(function () { return require("vite"); }).then(function (vite) {
        return vite.createServer({
            server: { middlewareMode: true },
        });
    });
var remixHandler = (0, express_1.createRequestHandler)({
    build: viteDevServer
        ? function () { return viteDevServer.ssrLoadModule("virtual:remix/server-build"); }
        : await Promise.resolve().then(function () { return require("./build/server/index.js"); }),
});
dotenv_1.default.config();
var app = (0, express_2.default)();
app.use((0, compression_1.default)());
// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");
// handle asset requests
if (viteDevServer) {
    app.use(viteDevServer.middlewares);
}
else {
    // Vite fingerprints its assets so we can cache forever.
    app.use("/assets", express_2.default.static("build/client/assets", { immutable: true, maxAge: "1y" }));
}
// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express_2.default.static("build/client", { maxAge: "1h" }));
app.use((0, morgan_1.default)("tiny"));
// handle SSR requests
app.all("*", remixHandler);
var port = process.env.PORT || 80;
var server = app.listen(port, function () {
    return console.log("Express server listening at http://localhost:".concat(port));
});
