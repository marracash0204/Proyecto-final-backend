import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const generateToken = async () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const token = buffer.toString("hex");
        resolve({ token, expiration: Date.now() + 3600000 });
      }
    });
  });
};

const generateAndStoreToken = async (email) => {
  try {
    const { token, expiration } = await generateToken();

    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { $set: { resetToken: token, resetTokenExpiration: expiration } },
      { new: true }
    );

    if (!updatedUser) {
      console.log(
        `No hay usuarios con el correo ${email} disponibles para actualizar.`
      );
      return {
        success: false,
        message: "Usuario no encontrado para actualizar token.",
      };
    }

    return { success: true, token };
  } catch (error) {
    console.error(
      "Error al generar token y almacenar en la base de datos:",
      error
    );
    return {
      success: false,
      message: "Error interno al generar y almacenar token.",
    };
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (user) {
      const isSameAsCurrentPassword = await bcrypt.compare(
        newPassword,
        user.password
      );
      if (isSameAsCurrentPassword) {
        console.error(
          "La nueva contraseña no puede ser igual a la contraseña actual."
        );
        return {
          success: false,
          message:
            "La nueva contraseña no puede ser igual a la contraseña actual.",
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;

      await user.save();

      return { success: true };
    } else {
      return { success: false, message: "Token no válido o ha expirado." };
    }
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    return {
      success: false,
      message: "Error interno al restablecer la contraseña.",
    };
  }
};

const getUserByToken = async (token) => {
  try {
    const user = await userModel.findOne({ resetToken: token });
    return user;
  } catch (error) {
    console.error("Error al obtener usuario por token:", error);
    return {
      success: false,
      message: "Error interno al obtener usuario por token.",
    };
  }
};

const isTokenExpired = async (token) => {
  try {
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    return !user;
  } catch (error) {
    console.error("Error al verificar la expiración del token:", error);
    return {
      success: false,
      message: "Error interno al verificar la expiración del token.",
    };
  }
};

async function toggleUserRoleRepo(userId, newRol) {
  try {
    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { rol: newRol } },
      { new: true }
    );

    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }

    return {
      success: true,
      message: "Rol de usuario actualizado con éxito.",
      newRol: user.rol,
    };
  } catch (error) {
    console.error("Error al cambiar el rol de usuario:", error);
    return {
      success: false,
      message: "Error interno al cambiar el rol de usuario.",
    };
  }
}

async function getUserById(userId) {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }
    return { success: true, user };
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    return {
      success: false,
      message: "Error interno al obtener usuario por ID.",
    };
  }
}

async function getAllUsersRepo() {
  try {
    const users = await userModel.find({}, { first_name: 1, email: 1, rol: 1 });
    return users;
  } catch (error) {
    console.error("Error al obtener todos los usuarios:", error);
    throw error;
  }
}

async function getInactiveUsers(daysInactive) {
  const inactiveDate = new Date();
  inactiveDate.setDate(inactiveDate.getDate() - daysInactive);

  try {
    const inactiveUsers = await userModel.find({
      last_connection: { $lt: inactiveDate },
    });

    return inactiveUsers;
  } catch (error) {
    console.error("Error al obtener usuarios inactivos:", error);
    throw error;
  }
}

async function deleteUsers(userIds) {
  try {
    const deleteResult = await userModel.deleteMany({ _id: { $in: userIds } });

    console.log(
      `${deleteResult.deletedCount} usuarios eliminados correctamente.`
    );

    return deleteResult.deletedCount;
  } catch (error) {
    console.error("Error al eliminar usuarios:", error);
    throw error;
  }
}

async function deleteUserById(userId) {
  try {
    const result = await userModel.findByIdAndDelete(userId);

    if (result) {
      return { success: true };
    } else {
      return {
        success: false,
        message: "No se pudo encontrar o eliminar el usuario.",
      };
    }
  } catch (error) {
    console.error("Error al eliminar usuario por ID:", error);
    return {
      success: false,
      message: "Error interno al eliminar usuario por ID.",
    };
  }
}

export {
  generateToken,
  resetPassword,
  generateAndStoreToken,
  getUserByToken,
  isTokenExpired,
  toggleUserRoleRepo,
  getUserById,
  getAllUsersRepo,
  getInactiveUsers,
  deleteUsers,
  deleteUserById,
};
