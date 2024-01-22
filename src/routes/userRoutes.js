import { userModel } from "../models/userModel.js";
import { cartManager } from "../service/cartsManager.js";
import { Router } from "express";
import passport from "passport";
import emailService from "../service/emailService.js";
import {
  generateAndStoreTokenService,
  resetPasswordService,
  getUserByTokenService,
  isTokenExpiredService,
  deleteInactiveUsersService,
  getAllUsersService,
  deleteUserByIdService,
} from "../service/userService.js";
import bcrypt from "bcrypt";
import { getUserById } from "../repository/userRepository.js";
import { changeUserRole } from "../service/userService.js";
import { isAdmin, isUserOrPremium } from "../middlewares/autMiddleware.js";
import logger from "../service/utilities/logger.js";
import multer from "multer";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fieldName = file.fieldname;
    let destination;

    switch (fieldName) {
      case "profile":
        destination = "src/public/files/profiles";
        break;
      case "product":
        destination = "src/public/files/products";
        break;
      case "document":
        destination = "src/public/files/documents";
        break;
      case "identification":
        destination = "src/public/files/identification";
        break;
      case "comprobanteCuenta":
        destination = "src/public/files/comprobanteCuenta";
        break;
      case "comprobanteDomicilio":
        destination = "src/public/files/comprobanteDomicilio";
        break;
      default:
        destination = "src/public/files/documents";
    }

    cb(null, destination);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

const cartsManager = new cartManager();
const router = Router();

router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener todos los usuarios:", error);
    res.status(500).json({ error: "Error interno al obtener usuarios." });
  }
});

router.get("/users/premium/:uId", isUserOrPremium, async (req, res) => {
  try {
    const userId = req.params.uId;
    const user = await getUserById(userId);
    console.log('user', user);

    return res.render("auth/rol", { user });
  } catch (error) {
    return error;
  }
});

router.post(
  "/users/:uid/documents",
  upload.fields([
    { name: "documents" },
    { name: "profile" },
    { name: "product" },
    { name: "identification" },
    { name: "comprobanteCuenta" },
    { name: "comprobanteDomicilio" },
  ]),
  async (req, res) => {
    try {
      const userId = req.params.uid;
      const result = await getUserById(userId);

      if (!result.success) {
        const errorMessage = result.message || "Usuario no encontrado";
        return res.status(404).json({ error: errorMessage });
      }

      const user = result.user;
      const uploadedFiles = req.files;

      user.documents = user.documents || [];

      if (uploadedFiles.documents) {
        user.documents.push(
          ...uploadedFiles.documents.map((file) => ({
            name: file.originalname,
            reference: `/files/documents/${file.originalname}`,
          }))
        );
      }

      if (uploadedFiles.profile) {
        user.documents.push(
          ...uploadedFiles.profile.map((file) => ({
            name: file.originalname,
            reference: `/files/profiles/${file.originalname}`,
          }))
        );
      }

      if (uploadedFiles.product) {
        user.documents.push(
          ...uploadedFiles.product.map((file) => ({
            name: file.originalname,
            reference: `/files/products/${file.originalname}`,
          }))
        );
      }
      if (uploadedFiles.identification) {
        user.documents.push(
          ...uploadedFiles.identification.map((file) => ({
            name: file.originalname,
            reference: `/files/identification/${file.originalname}`,
          }))
        );
      }
      if (uploadedFiles.comprobanteCuenta) {
        user.documents.push(
          ...uploadedFiles.comprobanteCuenta.map((file) => ({
            name: file.originalname,
            reference: `/files/comprobanteCuenta/${file.originalname}`,
          }))
        );
      }
      if (uploadedFiles.comprobanteDomicilio) {
        user.documents.push(
          ...uploadedFiles.comprobanteDomicilio.map((file) => ({
            name: file.originalname,
            reference: `/files/comprobanteDomicilio/${file.originalname}`,
          }))
        );
      }

      const redirectURL = `http://${req.get('host')}/profile`;
      res.status(200).redirect(redirectURL);
    } catch (error) {
      logger.error("Error al subir documentos:", error);
      res.status(500).json({ error: `Error al subir documentos: ${error.message}` });
    }
  }
);


router.post(
  "/signup",
  passport.authenticate("register", { failureRedirect: "/failregister" }),
  async (req, res) => {
    const newUser = req.user;
    const newCart = await cartsManager.createCart();
    newUser.cart = newCart._id;
    await newUser.save();
    req.session.cartId = newCart._id;
    
    const redirectURL = `http://${req.get('host')}/login`;
    res.redirect(redirectURL);
  }
);

router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/login" }),
  async (req, res) => {
    if (!req.user) {
      res.status(400).send();
    }

    req.session.rol =
      req.user.email === "adminCoder@coder.com" ? "admin" : "usuario";
    req.session.user = {
      first_name: req.user.nombre,
      last_name: req.user.apellido,
      email: req.user.email,
      age: req.user.edad,
      cart: req.user.cart,
    };

    req.session.cartId = req.user.cart;
    req.session.isLogged = true;
    const redirectURL = `http://${req.get('host')}/profile`;
    return res.redirect(redirectURL);
  }
);

router.post("/auth/recover-request", async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.render("error", { emailNotFound: true });
  }

  const token = await generateAndStoreTokenService(email);

  if (token) {
    const resetLink = `http://${req.get('host')}/recover-reset/${token}`;
    const mailOptions = {
      from: "shea.mitchell70@ethereal.email",
      to: user.email,
      subject: "Recuperación de Contraseña",
      html: `Haz clic <a href="${resetLink}">aquí</a> para restablecer tu contraseña. Este enlace expirará en 1 hora.`,
    };

    try {
      await emailService.sendEmail(mailOptions);
      res.render("auth/recoverRequest", {
        success:
          "Se ha enviado un correo con las instrucciones para restablecer tu contraseña.",
      });
    } catch (error) {
      console.error("Error al enviar el correo electrónico:", error);
      res.status(500).render("auth/recoverRequest", {
        error: "Error al enviar el correo de recuperación de contraseña.",
      });
    }
  } else {
    console.log("Error al generar y almacenar token.");
    res.render("auth/recoverRequest", {
      error: "Error al generar el token. Intenta nuevamente.",
    });
  }
});

router.post("/users/premium/:uid", isUserOrPremium, async (req, res) => {
  try {
    const userId = req.params.uid;
    const newRole = req.body.newRole;

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (user.rol === newRole) {
      return res
        .status(400)
        .json({ message: "El usuario ya tiene asignado el rol seleccionado." });
    }

    if (newRole === "premium") {
      const hasIdentificationDocument =
        user.documents &&
        user.documents.some((doc) =>
          doc.reference.startsWith("/files/identification/")
        );

      const hasComprobanteCuentaDocument =
        user.documents &&
        user.documents.some((doc) =>
          doc.reference.startsWith("/files/comprobanteCuenta/")
        );

      const hasComprobanteDomicilioDocument =
        user.documents &&
        user.documents.some((doc) =>
          doc.reference.startsWith("/files/comprobanteDomicilio/")
        );

      if (
        !hasIdentificationDocument ||
        !hasComprobanteCuentaDocument ||
        !hasComprobanteDomicilioDocument
      ) {
        return res.status(400).json({
          message: "El usuario no ha terminado de procesar su documentación.",
        });
      }
    }

    const success = await changeUserRole(userId, newRole);

    if (success) {
      return res
        .status(200)
        .json({ message: "Rol de usuario actualizado con éxito." });
    } else {
      return res
        .status(404)
        .json({ message: "No se pudo actualizar el rol del usuario." });
    }
  } catch (error) {
    console.error("Error al cambiar el rol de usuario:", error);
    res
      .status(500)
      .json({ message: "Error interno al cambiar el rol de usuario." });
  }
});

router.post("/admin/users/:uid", isAdmin, async (req, res) => {
  try {
    const userId = req.params.uid;
    const newRole = req.body.newRole;

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (user.rol === newRole) {
      return res
        .status(400)
        .json({ message: "El usuario ya tiene asignado el rol seleccionado." });
    }

    const success = await changeUserRole(userId, newRole);

    if (success) {
      return res
        .status(200)
        .json({ message: "Rol de usuario actualizado con éxito." });
    } else {
      return res
        .status(404)
        .json({ message: "No se pudo actualizar el rol del usuario." });
    }
  } catch (error) {
    console.error("Error al cambiar el rol de usuario:", error);
    res
      .status(500)
      .json({ message: "Error interno al cambiar el rol de usuario." });
  }
});

router.get("/recover-reset/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const isExpired = await isTokenExpiredService(token);

    if (isExpired) {
      return res.render("error", { tokenExpired: true });
    }

    res.render("auth/recoverReset", { token });
  } catch (error) {
    console.error(
      "Error al validar el token de restablecimiento de contraseña:",
      error
    );
    res.status(500).render("auth/recoverReset", {
      error: "Error al validar el token de restablecimiento de contraseña.",
    });
  }
});

router.post("/recover-reset/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.render("error", { notSamePass: true });
  }

  try {
    const user = await getUserByTokenService(token);

    if (!user) {
      return res.render("auth/recoverReset", {
        error:
          "El enlace de restablecimiento de contraseña no es válido o ha expirado. Intenta nuevamente.",
      });
    }

    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      user.password
    );
    if (isSameAsOldPassword) {
      return res.render("error", { sameAsOldPassword: true, token });
    }

    const success = await resetPasswordService(token, newPassword);

    if (success) {
      res.render("auth/recoverReset", {
        success:
          "Contraseña restablecida con éxito. Puedes iniciar sesión con tu nueva contraseña.",
      });
    } else {
      res.render("auth/recoverReset", {
        error:
          "El enlace de restablecimiento de contraseña no es válido o ha expirado. Intenta nuevamente.",
      });
    }
  } catch (error) {
    console.error(
      "Error en el proceso de restablecimiento de contraseña:",
      error
    );
    res.status(500).render("auth/recoverReset", {
      error: "Error en el proceso de restablecimiento de contraseña.",
    });
  }
});

router.delete("/users/", isAdmin, async (req, res) => {
  try {
    await deleteInactiveUsersService();
    res.status(204).send("los usuarios inactivos fueron eliminados con éxito.");
  } catch (error) {
    console.error("Error al eliminar usuarios inactivos:", error);
    res
      .status(500)
      .json({ error: "Error interno al eliminar usuarios inactivos." });
  }
});

router.post("/admin/users/:userId/delete", async (req, res) => {
  const userId = req.params.userId;

  try {
    const deletionResult = await deleteUserByIdService(userId);

    if (deletionResult.success) {
      return res.status(200).json({ message: "Usuario eliminado con éxito." });
    } else {
      return res
        .status(404)
        .json({ message: "No se pudo encontrar o eliminar el usuario." });
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res
      .status(500)
      .json({ error: "Error interno al eliminar usuario." });
  }
});

export default router;
