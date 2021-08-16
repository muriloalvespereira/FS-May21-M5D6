import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON } = fs

const productsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../products/products.json")

export const getProducts = () => readJSON(productsJSONPath)
export const writeProduct = content => writeJSON(productsJSONPath, content)
