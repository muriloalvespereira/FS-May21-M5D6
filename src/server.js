
import express from "express"
import cors from "cors"
import Products from "./products/index.js"
import Reviews from "./reviews/index.js"
import { join } from "path"
import {
  notFoundErrorHandler,
  forbiddenErrorHandler,
  badRequestErrorHandler,
  genericServerErrorHandler,
} from "./errorHandlers.js";
import config from './config/config.js';
import mongoose from 'mongoose';

const server = express()
const { PORT } = process.env;


const publicFolderPath = join(process.cwd(), "public")

const url = config.bd_string;
const options = { reconnectTries: Number.MAX_VALUE, reconnectInterval: 500, poolSize: 5, useNewUrlParser: true };

mongoose.connect(url, options);
mongoose.set('useCreateIndex', true);

mongoose.connection.on('error', (err) => {
    console.log('Erro na conexão com o banco de dados: ' + err);
})

mongoose.connection.on('disconnected', () => {
    console.log('Aplicação desconectada do banco de dados!');
})

mongoose.connection.on('connected', () => {
    console.log('Aplicação conectada ao banco de dados!');
})


server.use(express.static(publicFolderPath))


const whitelist= [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

const corsOpts = {
    origin: function(origin, next){
      console.log('ORIGIN --> ', origin)
      if(!origin || whitelist.indexOf(origin) !== -1){ // if received origin is in the whitelist I'm going to allow that request
        next(null, true)
      }else{ // if it is not, I'm going to reject that request
        next(new Error(`Origin ${origin} not allowed!`))
      }
    }
  }

server.use(cors(corsOpts))
server.use(express.json()) 

server.use("/products", Products);
server.use("/reviews", Reviews);

server.use(notFoundErrorHandler);
server.use(badRequestErrorHandler);
server.use(forbiddenErrorHandler);
server.use(genericServerErrorHandler);

server.listen(PORT, () => {
  console.log("Server Up" + PORT);
});
