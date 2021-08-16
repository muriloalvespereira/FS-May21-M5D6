import express from "express"
import cors from "cors"
import Products from "./products/index.js"
import Reviews from "./reviews/index.js"
import { join } from "path"

const server = express()
const port = 3005

const publicFolderPath = join(process.cwd(), "public")


server.use(express.static(publicFolderPath))
console.log(publicFolderPath)

server.use(cors())
server.use(express.json()) 


server.use("/products", Products)
server.use("/reviews", Reviews)

server.listen(port, () => {
    console.log("Server Up")
})