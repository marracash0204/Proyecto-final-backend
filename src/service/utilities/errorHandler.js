import { errorDictionary } from "./errorDictionary.js";

function createError(code) {
  const message = errorDictionary[code] || "Error desconocido.";
  const error = new Error(message);
  error.code = code;
  return error;
}

export { createError };
