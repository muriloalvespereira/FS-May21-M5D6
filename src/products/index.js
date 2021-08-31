import express from "express";
import {
  getProducts,
  writeProduct,
  getItemsReadableStream
} from "../lib/fs-tools.js";
import { getPDFReadableStream } from "../lib/pdf.js"
// import uniqid from "uniqid";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
// import { productValidationMiddleware } from "./validation.js";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import multer from "multer";
// import { saveProductPicture } from "../lib/fs-tools.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import Users from "../model/user.js";
import json2csv from "json2csv";
import { pipeline } from "stream";
import { sendEmail } from "../lib/email.js";

dotenv.config();

const Products = express.Router();

const { readJSON } = fs;

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
      console.log("I am here");
      const user = await Users.create(req.body);
      res.status(201).send(user);
    }
  } catch (error) {
    next(error);
  }
});

Products.post("/addimg", multer({ storage: cloudinaryStorage }).single("image"),
  async (req, res, next) => {
    try {
      console.log(req.file);
      res.send(req.file);
    } catch (error) {
      res.status(500).send({ success: false, message: "Generic Server Error" });
    }
  }
);

Products.post("/sendemail", async (req, res, next) => {
  const { email } = req.body;
  console.log(email)
  try {
    await sendEmail(email);
    res.send("Email Sent!");
    
  } catch (error) {
   res.status(error.code||500).send({message:error.message})
  }
});

// Products.get("/", async (req, res, next) => {
//   try {
//     const allProducts = await getProducts();
//     if (req.query && req.query.category) {
//       const filteredProducts = allProducts.filter(
//         (p) => p.category === req.query.category
//       );
//       res.send(filteredProducts);
//     } else {
//       res.status(200).send(allProducts);
//     }
//   } catch (error) {
//     next(error);
//   }
// });

Products.get("/", async (req, res, next) => {
  try {
    const allProducts = await Users.find();
      res.status(200).send(allProducts);
  } catch (error) {
    next(error);
  }
});

Products.get("/csv", async (req, res, next) => {
  try {
    const filename = "file.csv";
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    const source = getItemsReadableStream();
    const transform = new json2csv.Transform({
      fields: ["name", "category", "brand", "price"],
    });
    const destination = res;

    pipeline(source, transform, destination, (err) => {
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
});

Products.get("/pdf/:productId", async (req, res, next) => {
  try {
    const allProducts = await getProducts();
    const product = allProducts.filter((single) => single.id === req.params.productId);
    // const filename = "test.pdf"
    // res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
    // const source = await getPDFReadableStream(product)
    // const destination = res
    const path = await getPDFReadableStream(product, req)
    console.log(path)
    res.download(path)
    // pipeline(source, destination, err => {
    //   if (err) next(err)
    // })
  } catch (error) {
    next(error)
  }
})

Products.put("/:productId", async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
      s;
    } else {
      const userUpd = await Users.findByIdAndUpdate(
        { _id: req.params.productId },
        req.body
      );
      res.status(200).send(req.body);
    }
  } catch (error) {
    next(error);
  }
});
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
