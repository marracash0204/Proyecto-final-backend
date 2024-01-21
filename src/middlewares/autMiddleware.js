export const isAdminOrPremium = (req, res, next) => {
  if (
    req.isAuthenticated() &&
    (req.user.rol === "admin" || req.user.rol === "premium")
  ) {
    return next();
  } else {
    res
      .status(403)
      .send(
        "Acceso prohibido. Solo los administradores o usuarios premium pueden realizar esta acción."
      );
  }
};

export const isUser = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol === "usuario") {
    return next();
  } else {
    res
      .status(403)
      .send("Acceso prohibido. Solo los usuarios pueden realizar esta acción.");
  }
};

export const isUserOrPremium = (req, res, next) => {
  if (
    req.isAuthenticated() &&
    (req.user.rol === "usuario" || req.user.rol === "premium")
  ) {
    return next();
  } else {
    res
      .status(403)
      .send(
        "Acceso prohibido. Solo los usuarios o usuarios premium pueden realizar esta acción."
      );
  }
};

export const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol === "admin") {
    return next();
  } else {
    res
      .status(403)
      .send(
        "Acceso prohibido. Solo los Administradores pueden realizar esta acción."
      );
  }
};
