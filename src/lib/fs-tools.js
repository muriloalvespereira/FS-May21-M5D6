import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON, writeFile, createReadStream } = fs

const productsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../products/products.json")
const publicFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/img/")

export const getProducts = () => readJSON(productsJSONPath)
export const writeProduct = content => writeJSON(productsJSONPath, content)
export const saveProductPicture = (filename, contentAsBuffer) => writeFile(join(publicFolderPath, filename), contentAsBuffer)
export const getItemsReadableStream = () => createReadStream(productsJSONPath)