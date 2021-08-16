import express from "express";
import cors from "cors";
import Products from "./products/index.js";
import Reviews from "./reviews/index.js";
import {
  notFoundErrorHandler,
  forbiddenErrorHandler,
  badRequestErrorHandler,
  genericServerErrorHandler,
} from "./errorHandlers.js";

const server = express();

const port = 3005;

server.use(cors());
server.use(express.json());

server.use("/products", Products);
server.use("/reviews", Reviews);

server.use(notFoundErrorHandler);
server.use(badRequestErrorHandler);
server.use(forbiddenErrorHandler);
server.use(genericServerErrorHandler);

server.listen(port, () => {
  console.log("Server Up");
});
