import express from "express";
import fs from "fs-extra";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { reviewValidationMiddleware } from "./validation.js";
import { validationResult } from "express-validator";
import Reviews from "../model/review.js"
import Products from "../model/product.js"

const ReviewsRouter = express.Router();

const { readJSON, writeJSON } = fs;

ReviewsRouter.get("/", async (req, resp, next) => {
  try {
    const reviewsPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "reviews.json"
    );
    const reviews = await readJSON(reviewsPath);
    console.log(reviews);
    resp.send(reviews);
  } catch (err) {
    next(err);
  }
});

ReviewsRouter.get("/:_id", async (req, resp, next) => {
  try {
    const reviewsPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "reviews.json"
    );
    const reviews = await readJSON(reviewsPath);
    console.log(reviews);
    const singleReview = await reviews.find((r) => r._id === req.params._id);
    if (singleReview) {
      resp.send(singleReview);
    } else {
      next(createHttpError(404, `Review with id ${req.params._id} not found!`));
    }
  } catch (err) {
    next(err);
  }
});
 
ReviewsRouter.get("/product/:productID", async (req, resp, next) => {
  try {
    const reviewsPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "reviews.json"
    );
    const reviews = await readJSON(reviewsPath);
    console.log(reviews);
    const singleReview = await reviews.filter((r) => r.productId === req.params.productID);
    if (singleReview) {
      resp.send(singleReview);
    } else {
      next(createHttpError(404, `Review with id ${req.params._id} not found!`));
    }
  } catch (err) {
    next(err);
  }
});

// Reviews.post(
//   "/:productID",
//   reviewValidationMiddleware,
//   async (req, resp, next) => {
//     try {
//       const errorsList = validationResult(req);
//       if (!errorsList.isEmpty()) {
//         next(createHttpError(400, { errorsList }));
//       } else {
//         const reviewsPath = join(
//           dirname(fileURLToPath(import.meta.url)),
//           "reviews.json"
//         );
//         const reviews = await readJSON(reviewsPath);
//         const newReview = {
//           ...req.body,
//           _id: uniqid(),
//           productId: req.params.productID,
//           createdAt: new Date(),
//         };
//         const createReview = (content) => writeJSON(reviewsPath, content);
//         reviews.push(newReview);
//         await createReview(reviews);
//         resp.status(201).send({ _id: newReview._id });
//       }
//     } catch (err) {
//       next(err);
//     }
//   }
// );



ReviewsRouter.post("/:productID", reviewValidationMiddleware, async (req, resp, next) => {

try {
  const errorsList = validationResult(req);
  if (!errorsList.isEmpty()) {
    next(createHttpError(400, { errorsList }));
  } else {
    const review = await Reviews.create(req.body);
    if (review) {
      const commentId = review._id
      const addComment = await Products.findByIdAndUpdate(
        req.params.productID,
        { $push: { comments: commentId } }
      );
      resp.status(201).send(addComment);  
    } else {
      next(createHttpError(400, { errorsList }));
    }
  }
} catch (error) {
  next(error)
}
}
  
);

// ReviewsRouter.put("/:_id", reviewValidationMiddleware, async (req, resp, next) => {
//   try {
//     const errorsList = validationResult(req);
//     if (!errorsList.isEmpty()) {
//       next(createHttpError(400, { errorsList }));
//     } else {
//       const reviewsPath = join(
//         dirname(fileURLToPath(import.meta.url)),
//         "reviews.json"
//       );
//       const reviews = await readJSON(reviewsPath);
//       const remainingReviews = reviews.filter((r) => r._id !== req.params._id);
//       const modifiedReview = { ...req.body, _id: req.params._id };
//       console.log(modifiedReview);
//       remainingReviews.push(modifiedReview);
//       const changeReview = (content) => writeJSON(reviewsPath, content);
//       await changeReview(remainingReviews);
//       resp.send(modifiedReview);
//     }
//   } catch (err) {
//     next(err);
//   }
// });


ReviewsRouter.put("/:_id", reviewValidationMiddleware, async (req, resp, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      const updReview = await Reviews.findByIdAndUpdate(req.params._id, req.body, {new: true});
      resp.status(202).send(updReview);  
    }
  } catch (error) {
    next(error)
  }
  }
    
  );

// ReviewsRouter.delete("/:_id", async (req, resp, next) => {
//   try {
//     const reviewsPath = join(
//       dirname(fileURLToPath(import.meta.url)),
//       "reviews.json"
//     );
//     const reviews = await readJSON(reviewsPath);
//     const remainingReviews = reviews.filter((r) => r._id !== req.params._id);
//     const changeReview = (content) => writeJSON(reviewsPath, content);
//     await changeReview(remainingReviews);
//     resp.status(204).send();
//   } catch (err) {
//     next(err);
//   }
// });

ReviewsRouter.delete("/:_id", async (req, resp, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      const deleteReview = await Reviews.findByIdAndDelete(req.params._id);
      if (deleteReview) {
        resp.status(204).send();  
      } else {
        console.log("Deleted")
        next(createHttpError(400, { errorsList }
        ));
      }
    }
  } catch (error) {
    next(error)
  }
  }
    
  );

export default ReviewsRouter;
