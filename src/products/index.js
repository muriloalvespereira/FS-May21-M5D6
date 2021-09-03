import express from "express";
import { getItemsReadableStream } from "../lib/fs-tools.js";
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
import Products from "../model/product.js";
import json2csv from "json2csv";
import { pipeline } from "stream";
import { sendEmail } from "../lib/email.js";

dotenv.config();

const ProductsRouter = express.Router();

const { readJSON } = fs;

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary, // grabs CLOUDINARY_URL from process.env.CLOUDINARY_URL
  params: {
    folder: "Products",
  },
});

ProductsRouter.post("/", async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      console.log("I am here");
      const newProduct = await Products.create(req.body);
      res.status(201).send(newProduct);
    }
  } catch (error) {
    next(error);
  }
});

ProductsRouter.post("/addimg", multer({ storage: cloudinaryStorage }).single("image"), async (req, res, next) => {
    try {
      console.log(req.file);
      res.send(req.file);
    } catch (error) {
      res.status(500).send({ success: false, message: "Generic Server Error" });
    }
  }
);

ProductsRouter.post("/sendemail", async (req, res, next) => {
  const { email } = req.body;
  console.log(email)
  try {
    await sendEmail(email);
    res.send("Email Sent!");
    
  } catch (error) {
   res.status(error.code||500).send({message:error.message})
  }
});

// ProductsRouter.get("/", async (req, res, next) => {
//   try {
//     const allProductsRouter = await getProductsRouter();
//     if (req.query && req.query.category) {
//       const filteredProductsRouter = allProductsRouter.filter(
//         (p) => p.category === req.query.category
//       );
//       res.send(filteredProductsRouter);
//     } else {
//       res.status(200).send(allProductsRouter);
//     }
//   } catch (error) {
//     next(error);
//   }
// });

ProductsRouter.get("/", async (req, res, next) => {
  try {
    const allProductsRouter = await Products.find();
      res.status(200).send(allProductsRouter);
  } catch (error) {
    next(error);
  }
});

ProductsRouter.get("/csv", async (req, res, next) => {
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

// ProductsRouter.get("/pdf/:productId", async (req, res, next) => {
//   try {
//     const allProductsRouter = await getProductsRouter();
//     const product = allProductsRouter.filter((single) => single.id === req.params.productId);
//     // const filename = "test.pdf"
//     // res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
//     // const source = await getPDFReadableStream(product)
//     // const destination = res
//     const path = await getPDFReadableStream(product, req)
//     console.log(path)
//     res.download(path)
//     // pipeline(source, destination, err => {
//     //   if (err) next(err)
//     // })
//   } catch (error) {
//     next(error)
//   }
// })

ProductsRouter.get("/pdf/:productId", async (req, res, next) => {
  try {
    const product = await Products.findById(req.params.productId);
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

ProductsRouter.put("/:productId", async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
      s;
    } else {
      const userUpd = await Products.findByIdAndUpdate(
        { _id: req.params.productId },
        req.body,
        {
          new: true
        }
      );
      res.status(200).send(userUpd);
    }
  } catch (error) {
    next(error);
  }
});

// ProductsRouter.delete("/:productId", async (req, res, next) => {
//   try {
//     const allProductsRouter = await getProductsRouter();
//     const product = allProductsRouter.filter(
//       (single) => single.id !== req.params.productId
//     );

//     await writeProduct(product);
//     res.status(204).send(product);
//   } catch (error) {
//     next(error);
//   }
// });


ProductsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const product = await Products.findByIdAndDelete(req.params.productId);
    res.status(204).send(product);
  } catch (error) {
    next(error);
  }
});



ProductsRouter.get("/:productId/reviews", async (req, res, next) => {
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

// ProductsRouter.get("/:productId", async (req, res, next) => {
//   try {
//     const errorsList = validationResult(req);
//     if (!errorsList.isEmpty()) {
//       next(createHttpError(400, { errorsList }));
//     } else {
//       const allProductsRouter = await getProductsRouter();
//       const product = allProductsRouter.filter(
//         (single) => single.id == req.params.productId
//       );
//       res.status(200).send(product);
//     }
//   } catch (error) {
//     next(error);
//   }
// });

ProductsRouter.get("/:productId", async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      const product = await Products.findById(req.params.productId).populate("comments");
      res.status(200).send(product);
    }
  } catch (error) {
    next(error);
  }
});

export default ProductsRouter;
