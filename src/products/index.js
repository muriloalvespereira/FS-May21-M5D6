import express from "express";
import { getProducts, writeProduct } from "../lib/fs-tools.js";
import uniqid from "uniqid";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import { productValidationMiddleware } from "./validation.js";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import multer from "multer";
import { saveProductPicture } from "../lib/fs-tools.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import Users from "../model/user.js";

dotenv.config();

const Products = express.Router();

const { readJSON } = fs;

// const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

// cloudinary.config({
//     cloud_name: CLOUDINARY_NAME,
//     api_key: CLOUDINARY_KEY,
//     api_secret: CLOUDINARY_SECRET,
//   });

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary, // grabs CLOUDINARY_URL from process.env.CLOUDINARY_URL
  params: {
    folder: "products",
  },
});

Products.post("/", async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
        console.log("I am here")
      const user = await Users.create(req.body);
      res.status(201).send(user);
    }
  } catch (error) {
    next(error);
  }
});

Products.post(
  "/addimg",
  multer({ storage: cloudinaryStorage }).single("image"),
  async (req, res, next) => {
    try {
      console.log(req.file);
      res.send({ message: 'Uploaded!' });
    } catch (error) {
      res.status(500).send({ success: false, message: "Generic Server Error" });
    }
  }
);

Products.get("/", async (req, res, next) => {
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

Products.put(
  "/:productId",
  productValidationMiddleware,
  async (req, res, next) => {
    try {
      const errorsList = validationResult(req);
      if (!errorsList.isEmpty()) {
        next(createHttpError(400, { errorsList }));
      } else {
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
        res.status(200).send(updateProduct);
      }
    } catch (error) {
      next(error);
    }
  }
);
Products.delete("/:productId", async (req, res, next) => {
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

Products.get("/:productId/reviews", async (req, res, next) => {
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

Products.get("/:productId", async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      const allProducts = await getProducts();
      const product = allProducts.filter(
        (single) => single.id == req.params.productId
      );
      res.status(200).send(product);
    }
  } catch (error) {
    next(error);
  }
});

export default Products;
