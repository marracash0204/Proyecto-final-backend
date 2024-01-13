import { cartRepo } from "../repository/cartsRepository.js";
import { UserProfileDTO } from "../dto/userProfileDto.js";
import logger from "./utilities/logger.js";

const cartsRepo = new cartRepo();

export class cartManager {
  async getAllCart() {
    try {
      const carts = await cartsRepo.getAllCartRepo();
      return carts;
    } catch (error) {
      logger.error("Error en getAllCart:", error);
      throw error;
    }  
  }

  async addCart(cart) {
    try {
      const addCart = await cartsRepo.addCartRepo(cart);
      return addCart;
    } catch (error) {
      logger.error("Error en addCart:", error);
      throw error;
    }
  }

  async getCartById(id) {
    try {
      const cartsById = await cartsRepo.getCartByIdRepo(id);
      return cartsById;
    } catch (error) {
      logger.error("Error en getCartById:", error);
      throw error;
    }
  }

  async updateCart(cartId, updatedCart) {
    try {
      const result = await cartsRepo.updateCartRepo(cartId, updatedCart);

      if (!result) {
        logger.error("Carrito no encontrado");
      }

      return result;
    } catch (error) {
      logger.error("Error en updateCart:", error);
      throw error;
    }
  }

  async updateProductQuantity(cartId, productId, newQuantity) {
    try {
      const updatedCart = await cartsRepo.updateProductQuantityRepo(
        cartId,
        productId,
        newQuantity
      );

      if (!updatedCart) {
        logger.error("Carrito o producto no encontrado");
      }

      return updatedCart;
    } catch (error) {
      throw error;
    }
  }

  async deleteProductFromCart(cartId, productId) {
    try {
      const result = await cartsRepo.deleteProductFromCartRepo(
        cartId,
        productId
      );

      if (result && result.productNotFound) {
        return { noProducts: true };
      }

      return result;
    } catch (error) {
      console.error("Error en deleteProductFromCart:", error);
      throw error;
    }
  }

  async deleteProductFromAllCart(cartId, productId) {
    try {
      const updatedCart = await cartsRepo.deleteProductFromCartAllRepo(
        cartId,
        productId
      );
      return updatedCart;
    } catch (error) {
      console.error("Error en deleteProductFromCart:", error);
      throw error;
    }
  }

  async clearCart(cartId) {
    try {
      const updatedCart = await cartsRepo.clearCartRepo(cartId);
      return updatedCart;
    } catch (error) {
      console.error("Error en clearCart:", error);
      throw error;
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      const cart = await cartsRepo.addProductToCartRepo(cartId, productId);
      return cart;
    } catch (error) {
      console.error("Error en addProductToCart:", error);
      throw error;
    }
  }

  async createCart() {
    try {
      const cartId = await cartsRepo.createCartRepo();
      return cartId;
    } catch (error) {
      console.error("Error al crear un carrito:", error);
      throw error;
    }
  }

  async getUserProfile(user) {
    try {
      const userProfileDTO = UserProfileDTO.createFromModel(user);

      if (user.cart) {
        userProfileDTO.cart = await cartsRepo.getCartByIdRepo(user.cart);
      }

      return userProfileDTO;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      throw error;
    }
  }
  async finalizePurchase(cartId) {
    try {
      const cart = await cartsRepo.getCartByIdRepo(cartId);

      if (!cart) {
        logger.info("No se encontro el id del carrito");
        throw new Error("Carrito no encontrado");
      }

      const failedProductIds = [];

      for (const product of cart.products) {
        await cartsRepo.deleteProductFromCartAllRepo(
          cartId,
          product.product._id
        );
      }

      await cartsRepo.filterFailedProductsRepo(cartId, failedProductIds);

      const totalAmount = cartsRepo.calculateTotalAmount(cart.products);
      return { updatedCart: cart, totalAmount };
    } catch (error) {
      console.error("Error en finalizePurchase:", error);
      throw error;
    }
  }
}
