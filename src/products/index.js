
import express from "express";
import { getProducts, writeProduct } from "../lib/fs-tools.js";
import uniqid from "uniqid";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import { productValidationMiddleware } from "./validation.js";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import multer from "multer"
import { saveProductPicture } from "../lib/fs-tools.js"

const Products = express.Router();

const { readJSON } = fs;

Products.post("/", productValidationMiddleware, async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      const allProducts = await getProducts();
      const product = {
        ...req.body,
        id: uniqid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      allProducts.push(product);

      await writeProduct(allProducts);
      res.status(201).send(product);
    }
  } catch (error) {
    next(error);
  }
});

Products.post("/addimg", multer().single("image"), async (req, res) => {
    try {
        await saveProductPicture(req.file.originalname, req.file.buffer)
        res.send("Uploaded!")
    } catch (error) {
        res.status(500).send({ success: false, message: "Generic Server Error" }) 
    }
})

Products.get("/", async (req, res) => {
  try {
    const allProducts = await getProducts();
    if (req.query && req.query.category) {
      const filteredProducts = allProducts.filter(
        (p) => p.category === req.query.category
      );
      res.send(filteredProducts);
    } else {
      res.status(200).send(allProducts);
    }
  } catch (error) {
    next(error);
  }
});

Products.put("/:productId", async (req, res) => {
  try {
    const allProducts = await getProducts();
    const product = allProducts.filter(
      (single) => single.id !== req.params.productId
    );
    const updateProduct = {
      ...req.body,
      id: req.params.productId,
      updatedAt: new Date(),
    };
    product.push(updateProduct);

    await writeProduct(product);
    res.status(200).send(product);
  } catch (error) {
    next(error);
  }
});
Products.delete("/:productId", async (req, res) => {
  try {
    const allProducts = await getProducts();
    const product = allProducts.filter(
      (single) => single.id !== req.params.productId
    );

    await writeProduct(product);
    res.status(204).send(product);
  } catch (error) {
    next(error);
  }
});

Products.get("/:productId/reviews", async (req, res) => {
  try {
    const reviewsPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "../reviews/reviews.json"
    );
    const reviews = await readJSON(reviewsPath);
    const productReviews = reviews.filter(
      (r) => r.productId === req.params.productId
    );

    res.send(productReviews);
  } catch (error) {
    next(error);
  }
});

export default Products;
