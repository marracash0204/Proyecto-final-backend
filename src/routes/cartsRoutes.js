import { Router } from "express";
import mongoose from "mongoose";
import { productsManager } from "../service/productsManager.js";
import { cartManager } from "../service/cartsManager.js";
import logger from "../service/utilities/logger.js";

const productManager = new productsManager();
const cartsManager = new cartManager();
const cartRouter = Router();

cartRouter.post("/", async (req, res) => {
  try {
    const cart = { products: [] };
    const cartId = await cartsManager.addCart(cart);

    res.status(200).json({ message: "Cart Created", cartId });
  } catch (error) {
    logger.error("Error al crear un nuevo carrito:", error);
    res.status(500).json("Error al crear un nuevo carrito");
  }
});

cartRouter.get("/", async (req, res) => {
  try {
    const allCartsPromise = await cartsManager.getAllCart();
    const allCarts = await Promise.all(allCartsPromise);
    console.log(allCarts);
    res.status(200).send(allCarts);
  } catch (error) {
    logger.error("Error al obtener todos los carritos:", error);
    res.status(500).send("Error al obtener todos los carritos");
  }
});

cartRouter.get("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cartEncounter = await cartsManager.getCartById(cartId);
    res.json(cartEncounter);
  } catch (error) {
    logger.error("Error al obtener los productos del carrito:", error);
    res.status(500).send("Error al obtener los productos del carrito");
  }
});

cartRouter.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).send("ID de producto no válido");
      return;
    }

    const cart = await cartsManager.getCartById(cartId);

    if (!cart) {
      res.status(404).send("Carrito no encontrado");
      return;
    }

    const product = await productManager.getProductById(productId);

    if (!product) {
      res.status(404).send("Producto no encontrado");
      return;
    }

    const existingProductIndex = cart.products.findIndex((item) => {
      return item.product && item.product._id.toString() === productId;
    });

    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += 1;
    } else {
      cart.products.push({ product, quantity: 1 });
    }

    await cartsManager.updateCart(cartId, cart);

    res.status(200).send("Producto agregado al carrito");
  } catch (error) {
    logger.error("Error al agregar producto al carrito:", error);
    res.status(500).send("Error al agregar producto al carrito");
  }
});

cartRouter.put("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const updatedProducts = req.body.products;

    const cart = await cartsManager.getCartById(cartId);
    if (!cart) {
      res.status(404).send("Carrito no encontrado");
      return;
    }

    cart.products = updatedProducts;

    await cartsManager.updateCart(cartId, cart);

    res.status(200).send("Carrito actualizado con éxito");
  } catch (error) {
    logger.error("Error al actualizar el carrito:", error);
    res.status(500).send("Error al actualizar el carrito");
  }
});

cartRouter.put("/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const newQuantity = req.body.quantity;

    await cartsManager.updateProductQuantity(cartId, productId, newQuantity);

    res.status(200).send("Cantidad de producto en el carrito actualizada");
  } catch (error) {
    logger.error(
      "Error al actualizar la cantidad del producto en el carrito:",
      error
    );
    res
      .status(500)
      .send("Error al actualizar la cantidad del producto en el carrito");
  }
});

cartRouter.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    await cartsManager.deleteProductFromCart(cartId, productId);

    res.status(200).send("Producto eliminado del carrito");
  } catch (error) {
    logger.error("Error al eliminar producto del carrito:", error);
    res.status(500).send("Error al eliminar producto del carrito");
  }
});

cartRouter.delete("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    await cartsManager.clearCart(cartId);

    res.status(200).send("Todos los productos del carrito fueron eliminados");
  } catch (error) {
    logger.error("Error al eliminar todos los productos del carrito:", error);
    res.status(500).send("Error al eliminar todos los productos del carrito");
  }
});

export default cartRouter;
