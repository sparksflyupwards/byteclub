import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import dotenv from 'dotenv';
import fs from 'node:fs';

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : await import("./build/server/index.js"),
});

dotenv.config();
const app = express();

const questionsDirectory = "./byteclub-questions"

var fileJSONObjects = []

const questionFiles = fs.readdirSync(questionsDirectory)
if (questionFiles) {
  questionFiles.forEach((fileName) => {
    if (fileName.split(".")[1] === "json") {
      let tempFile = fs.readFileSync(questionsDirectory + "/" + fileName, "utf-8");
      let fileJSON = JSON.parse(tempFile)
      console.log(fileJSON.testCase[0].input)
      fileJSONObjects.push(fileJSON)
    }
  });
}

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny"));

// handle SSR requests
app.all("*", remixHandler);

const port = process.env.PORT || 80;
const server = app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`)
);
