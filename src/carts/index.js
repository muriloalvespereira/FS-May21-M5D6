import express from "express";
import Carts from '../model/cart.js'


const cartRouter = express.Router();
cartRouter.post("/", async (req, res, next) => {
    try {
        const newCart = await Carts.create(req.body);
        res.status(201).send(newCart);
      
    } catch (error) {
      next(error);
    }
  });
cartRouter.get("/", async (req, res, next) => {
    try {
        const allCarts = await Carts.find().populate("productId");
      res.status(200).send(allCarts);
      
    } catch (error) {
      next(error);
    }
});
cartRouter.get("/:_id", async (req, res, next) => {
    try {
        const cart = await Carts.findById(req.params._id).populate("productId");
        res.status(200).send(cart);
      
    } catch (error) {
      next(error);
    }
});
cartRouter.put("/:_id", async (req, res, next) => {
    try {
        const updateCart = await Carts.findByIdAndUpdate(
            { _id: req.params._id },
            req.body,
            {
              new: true
            }
          );
          res.status(200).send(updateCart);
      
    } catch (error) {
      next(error);
    }
  });
  cartRouter.delete("/:_id", async (req, res, next) => {
    try {
        const cart = await Carts.findByIdAndDelete(req.params._id);
        res.status(204).send(cart);
      
    } catch (error) {
      next(error);
    }
  });
export default cartRouter;

