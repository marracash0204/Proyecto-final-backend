import { cartModel } from "../models/cartModel.js";
import { CartDTO } from "../dto/cartDto.js";
import { productsManager } from "../service/productsManager.js";
import { createError } from "../service/utilities/errorHandler.js";
import logger from "../service/utilities/logger.js";

const productManager = new productsManager();

export class cartRepo {
  async mapToDTO(cartModel) {
    const products = cartModel.products ? cartModel.products : [];
    const id = cartModel._id;
    return new CartDTO(id, products);
  }

  async getAllCartRepo() {
    try {
      const carts = await cartModel.find().populate("products.product").lean();

      return carts.map((cart) => this.mapToDTO(cart));
    } catch (error) {
      logger.error("Error en getAllCartRepo:", error);
      throw error;
    }
  }

  async addCartRepo(cart) {
    try {
      const addCart = await cartModel.create(cart);
      const carts = await cartModel.findById(addCart._id);
      return this.mapToDTO(carts);
    } catch (error) {
      logger.error("Error al crear un carrito:", error);
      throw error;
    }
  }

  async getCartByIdRepo(id) {
    try {
      const cartById = await cartModel
        .findById(id)
        .populate("products.product");
      if (!cartById) {
        logger.error("Carrito no encontrado");
        return null;
      }
      return this.mapToDTO(cartById);
    } catch (error) {
      logger.error("Error en getCartByIdRepo:", error);
      throw error;
    }
  }

  async updateCartRepo(cartId, updatedCart) {
    try {
      const result = await cartModel.findByIdAndUpdate(
        cartId,
        { $set: { products: updatedCart.products } },
        { new: true }
      );

      if (!result) {
        logger.fatal("No se encuentra el id");
        throw createError("MISSING_CART_ID");
      }

      return this.mapToDTO(result);
    } catch (error) {
      logger.error("Error en updateCartRepo:", error);
      throw error;
    }
  }

  async updateProductQuantityRepo(cartId, productId, newQuantity) {
    try {
      const updatedCart = await cartModel
        .findOneAndUpdate(
          { _id: cartId, "products.product": productId },
          { $set: { "products.$.quantity": newQuantity } },
          { new: true }
        )
        .lean();

      return this.mapToDTO(updatedCart);
    } catch (error) {
      logger.error("Error en updateProductQuantityRepo:", error);
      throw error;
    }
  }

  async deleteProductFromCartRepo(cartId, productId) {
    try {
      const cart = await cartModel
        .findById(cartId)
        .populate("products.product");

      if (!cart) {
        logger.fatal("No se encuentra el id");
        throw createError("MISSING_CART_ID");
      }

      const existingProduct = cart.products.find((product) =>
        product.product._id.equals(productId)
      );

      if (!existingProduct) {
        return { productNotFound: true };
      }

      await productManager.updateStock(productId, -1);

      existingProduct.quantity--;

      cart.products = cart.products.filter((product) => product.quantity > 0);

      await cart.save();

      return this.mapToDTO(cart);
    } catch (error) {
      logger.error("Error en deleteProductFromCartRepo:", error);
      throw error;
    }
  }

  async deleteProductFromCartAllRepo(cartId, productId) {
    try {
      const cart = await cartModel.findById(cartId);
      if (!cart) {
        logger.error("No se encuentra el id");
        throw createError("MISSING_CART_ID");
      }

      const productInCart = cart.products.find((product) =>
        product.product.equals(productId)
      );

      if (!productInCart) {
        logger.fatal("No es posible encontrar el producto");
        throw createError("PRODUCT_NOT_FOUND");
      }

      cart.products = cart.products.filter(
        (product) => !product.product.equals(productId)
      );

      await cart.save();

      return this.mapToDTO(cart);
    } catch (error) {
      logger.error("Error en deleteProductFromCartAllRepo:", error);
      throw error;
    }
  }

  async clearCartRepo(cartId) {
    try {
      const updatedCart = await cartModel
        .findByIdAndUpdate(cartId, { products: [] }, { new: true })
        .lean();

      if (!updatedCart) {
        logger.error("No se encuentra el cart Id");
        throw createError("MISSING_CART_ID");
      }

      return this.mapToDTO(updatedCart);
    } catch (error) {
      logger.error("Error en clearCartRepo:", error);
      throw error;
    }
  }

  async addProductToCartRepo(cartId, productId) {
    try {
      const cart = await cartModel
        .findById(cartId)
        .populate("products.product");

      if (!cart) {
        logger.error("No es posible encontrar el cartId");
        throw createError("MISSING_CART_ID");
      }

      const product = await productManager.getProductById(productId);

      if (!product) {
        logger.fatal("No se encontro el id de producto");
        throw createError("PRODUCT_NOT_FOUND");
      }

      if (product.stock <= 0) {
        return null;
      }

      const existingProduct = cart.products.find((product) =>
        product.product._id.equals(productId)
      );

      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      await productManager.updateStock(productId, 1);

      await cart.save();

      return this.mapToDTO(cart);
    } catch (error) {
      logger.error("Error en addProductToCartRepo:", error);
      throw error;
    }
  }

  async filterFailedProductsRepo(cartId, failedProductIds) {
    try {
      const updatedCart = await cartModel
        .findById(cartId)
        .populate("products.product");

      if (!updatedCart) {
        logger.fatal("No se pudo encontrar el id del carrito");
        throw createError("MISSING_CART_ID");
      }

      updatedCart.products = updatedCart.products.filter(
        (product) => !failedProductIds.includes(product.product._id.toString())
      );

      await updatedCart.save();

      return this.mapToDTO(updatedCart);
    } catch (error) {
      logger.error("Error en filterFailedProductsRepo:", error);
      throw error;
    }
  }

  calculateTotalAmount(products) {
    return products.reduce((total, product) => {
      return total + product.quantity * product.product.price;
    }, 0);
  }

  async finalizePurchaseRepo(cartId) {
    try {
      const cart = await cartModel
        .findById(cartId)
        .populate("products.product");

      if (!cart) {
        logger.error("No se encontro el id el carrito");
        throw createError("MISSING_CART_ID");
      }

      const failedProductIds = [];

      for (const product of cart.products) {
        await this.deleteProductFromCartAllRepo(cartId, product.product._id);
      }

      await this.filterFailedProductsRepo(cartId, failedProductIds);

      const totalAmount = this.calculateTotalAmount(cart.products.price);
      return { updatedCart: cart, totalAmount };
    } catch (error) {
      logger.error("Error en finalizePurchaseRepo:", error);
      throw error;
    }
  }

  async createCartRepo() {
    try {
      const newCart = await cartModel.create({
        products: [],
      });

      return newCart._id;
    } catch (error) {
      logger.error("Error al crear un carrito:", error);
      throw error;
    }
  }
}
