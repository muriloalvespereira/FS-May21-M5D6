import { body } from "express-validator";

export const productValidationMiddleware = [
  body("name").exists().withMessage("Name is a mandatory field!"),
  body("description").exists().withMessage("Description is a mandatory field!"),
  body("brand").exists().withMessage("Brand is a mandatory field!"),
  body("imageUrl").exists().withMessage("Image Url is a mandatory field!"),
  body("price").exists().withMessage("Price is a mandatory field!"),
  body("category").exists().withMessage("Category is a mandatory field!"),
];
