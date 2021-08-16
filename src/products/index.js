import express from "express"
import { getProducts, writeProduct } from "../lib/fs-tools.js"
import uniqid from "uniqid"

const Products = express.Router()

Products.post("/", async (req, res) => {
    try {
        const allProducts = await getProducts();
        const product = { ...req.body, id: uniqid(), createdAt: new Date(), updatedAt: new Date() }
        allProducts.push(product)
       

        await writeProduct(allProducts)
        res.status(201).send(product); 
    } catch (error) {
        res.status(500).send({ success: false, message: "Generic Server Error" }) 
    }
})
Products.get("/", async (req, res) => {
    try {
        const allProducts = await getProducts();       
        res.status(200).send(allProducts); 
    } catch (error) {
        res.status(500).send({ success: false, message: "Generic Server Error" }) 
    }
})

Products.put("/:productId", async (req, res) => {
    try {
        const allProducts = await getProducts();
        const product = allProducts.filter(single => single.id !== req.params.productId)
        const updateProduct = { ...req.body, id: req.params.productId, updatedAt: new Date() }
        product.push(updateProduct)
       

        await writeProduct(product)
        res.status(200).send(product); 
    } catch (error) {
        res.status(500).send({ success: false, message: "Generic Server Error" }) 
    }
})
Products.delete("/:productId", async (req, res) => {
    try {
        const allProducts = await getProducts();
        const product = allProducts.filter(single => single.id !== req.params.productId)       

        await writeProduct(product)
        res.status(204).send(product); 
    } catch (error) {
        res.status(500).send({ success: false, message: "Generic Server Error" }) 
    }
})

export default Products