import { Router } from "express";
import { productsManager } from "../service/productsManager.js";
import { messageManager } from "../service/messageManager.js";
import { cartManager } from "../service/cartsManager.js";
import passport from "passport";
import { isUser, isAdminOrPremium } from "../middlewares/autMiddleware.js";
import { generateMockProducts } from "../service/mockingModule.js";
import logger from "../service/utilities/logger.js";
import { userModel } from "../models/userModel.js";

const cartsManager = new cartManager();
const messagesManager = new messageManager();
const productManager = new productsManager();

const router = Router();

router.get("/", async (req, res) => {
  const products = await productManager.getAllproduct();
  res.render("home", { products });
});

router.get("/realtimeproducts", async (req, res) => {
  const products = await productManager.getAllproduct();
  res.render("product/realTimeProducts", { products });
});

router.get("/chat", isUser, async (req, res) => {
  const messages = await messagesManager.getAllMessage();
  res.render("chat", { messages });
});

router.get("/cart/:cartId", async (req, res) => {
  const cartId = req.params.cartId;

  const cart = await cartsManager.getCartById(cartId);

  res.render("cart/cart", { cart });
});

router.get("/products", async (req, res) => {
  try {
    const user = req.user;
    if (!req.session.cartId) {
      const newCart = await cartsManager.createCart();
      req.session.cartId = newCart._id;
    }

    const page = req.query.page || 1;
    const limit = 6;

    const productsResult = await productManager.getPaginatedProducts(
      page,
      limit
    );
    const products = productsResult.docs;
    const totalPages = productsResult.totalPages;

    return res.render("product/products", {
      user,
      products,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    logger.error("Error al obtener productos paginados:", error);
    res.status(500).send("Error al obtener productos");
  }
});

router.get("/addproduct", isAdminOrPremium, async (req, res) => {
  try {
    const products = await productManager.getAllproduct();
    res.render("product/addProducts", { products });
  } catch (error) {
    logger.error(
      "Error al renderizar la vista de agregar o modificar productos:",
      error
    );
    res
      .status(500)
      .send("Error al renderizar la vista de agregar o modificar productos");
  }
});

router.get("/modifyProduct", isAdminOrPremium, async (req, res) => {
  try {
    const allProducts = await productManager.getAllproduct();
    res.render("product/modifyProduct", { allProducts });
  } catch (error) {
    logger.log("Error al obtener todos los productos", error);
    res.status(500).send("Error al renderizar la vista modifyProduct");
  }
});

router.get("/profile", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const user = req.user;
      const userProfile = await cartsManager.getUserProfile(user);
      const cartId = user.cart._id;
      const userId = user._id;

      return res.render("user/profile", { user: userProfile, cartId, userId });
    }

    if (req.session && req.session.email) {
      const userProfile = await cartsManager.getUserProfile(req.session);
      const cartId = user.cart._id;

      return res.render("user/profile", { user: userProfile, cartId });
    }

    return res.redirect("/login");
  } catch (error) {
    logger.error("Error al renderizar el perfil:", error);
    res.status(500).send("Error al renderizar el perfil");
  }
});

router.get("/recover-request", (req, res) => {
  res.render("auth/recoverRequest");
});

router.get("/recover-reset/:token", async (req, res) => {
  const { token } = req.params;
  console.log("usuario con token:", token);
  const user = await userModel.findOne({ resetToken: token });
  console.log("usuario encontrado con los datos:", user);
  if (
    !user ||
    !user.resetTokenExpiration ||
    user.resetTokenExpiration <= Date.now()
  ) {
    return res.render("error", { tokenExpired: true });
  }

  res.render("auth/recoverReset", { token });
});

router.get("/signup", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/login");
  }

  res.render("auth/signup");
}); 

router.get("/login", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/products");
  }
  res.render("auth/login");
});

router.get("/recover", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/products");
  }
  res.render("auth/recover");
});

router.get("/failregister", (req, res) => res.send("Fallo en registro"));

router.get("/faillogin", (req, res) => res.send("Fallo en login"));

router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/api/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    req.session.first_name = req.user.first_name;
    req.session.last_name = req.user.last_name;
    req.session.email = req.user.email;
    req.session.age = req.user.age;

    if (req.user.cart) {
      req.session.cartId = req.user.cart;
    }
    req.session.isLogged = true;
    res.redirect("/profile");
  }
);

router.get("/mockingProducts", (req, res) => {
  try {
    const quantity = 100;
    const products = generateMockProducts(quantity);
    res.render("product/faker", { products });
  } catch (error) {
    logger.error("Error al generar productos ficticios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
