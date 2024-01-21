import {
  generateToken,
  resetPassword,
  generateAndStoreToken,
  getUserByToken,
  isTokenExpired,
  toggleUserRoleRepo,
  getUserById,
  getInactiveUsers,
  deleteUsers,
  getAllUsersRepo,
  deleteUserById,
} from "../repository/userRepository.js";
import emailService from "./emailService.js";
import config from "../config/config.js";

async function generateTokenService() {
  try {
    const { token, expiration } = await generateToken();
    return { success: true, token, expiration };
  } catch (error) {
    console.error("Error al generar token:", error);
    return { success: false, message: "Error al generar token." };
  }
}

async function generateAndStoreTokenService(email) {
  try {
    const { token, expiration } = await generateTokenService();
    const storedToken = await generateAndStoreToken(email, token, expiration);
    return { success: true, token: storedToken };
  } catch (error) {
    console.error("Error al generar y almacenar token:", error);
    return { success: false, message: "Error al generar y almacenar token." };
  }
}

async function resetPasswordService(token, newPassword) {
  try {
    const passwordResetResult = await resetPassword(token, newPassword);
    return passwordResetResult;
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    return { success: false, message: "Error al restablecer la contraseña." };
  }
}

async function getUserByTokenService(token) {
  try {
    const user = await getUserByToken(token);
    return { success: true, user };
  } catch (error) {
    console.error("Error en getUserByTokenService:", error);
    return { success: false, message: "Error al obtener usuario por token." };
  }
}

async function isTokenExpiredService(token) {
  try {
    const isExpired = await isTokenExpired(token);
    return { success: isExpired, expired: isExpired };
  } catch (error) {
    console.error("Error al verificar la expiración del token:", error);
    return {
      success: false,
      message: "Error al verificar la expiración del token.",
    };
  }
}

async function changeUserRole(userId, newRole) {
  try {
    const result = await toggleUserRoleRepo(userId, newRole);

    if (result.success) {
      console.log("Rol cambiado con éxito:", result.message);
      return true;
    } else {
      console.error("Error al cambiar de rol:", result.message);
      return false;
    }
  } catch (error) {
    console.error("Error al cambiar de rol:", error);
    return false;
  }
}

async function getUserByIdService(userId) {
  try {
    const user = await getUserById(userId);

    if (user.success) {
      return { success: true, user: user.user };
    } else {
      return { success: false, message: "Error al obtener el usuario." };
    }
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return { success: false, message: "Error al obtener el usuario." };
  }
}

async function getAllUsersService() {
  try {
    const users = await getAllUsersRepo();
    return users;
  } catch (error) {
    console.error("Error al obtener todos los usuarios:", error);
    throw error;
  }
}

async function deleteInactiveUsersService() {
  try {
    const daysInactive = 2;

    const inactiveUsers = await getInactiveUsers(daysInactive);

    if (inactiveUsers.length > 0) {
      await Promise.all(
        inactiveUsers.map(async (user) => {
          const mailOptions = {
            from: config.emailUser,
            to: user.email,
            subject: "Eliminación de Cuenta por Inactividad",
            text: `Hola,\n\nTu cuenta ha sido eliminada debido a inactividad. Si deseas seguir utilizando nuestros servicios, por favor, regístrate nuevamente.`,
          };

          await emailService.sendEmail(mailOptions);
        })
      );

      await deleteUsers(inactiveUsers);
    }

    return true;
  } catch (error) {
    console.error("Error al eliminar usuarios inactivos:", error);
    throw error;
  }
}

async function deleteUserByIdService(userId) {
  try {
    const deletionResult = await deleteUserById(userId);

    if (deletionResult.success) {
      return { success: true };
    } else {
      return {
        success: false,
        message: "No se pudo encontrar o eliminar el usuario.",
      };
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
}

export {
  generateTokenService,
  generateAndStoreTokenService,
  resetPasswordService,
  getUserByTokenService,
  isTokenExpiredService,
  changeUserRole,
  getUserByIdService,
  getAllUsersService,
  deleteInactiveUsersService,
  deleteUserByIdService,
};
