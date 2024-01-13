import { promises as fsPromises } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cartFilePath = path.join(__dirname, `../../../cart.json`);

export class cartManager {
  lastCartId = 0;

  async UniqueId(existingCarts) {
    let newCartId = lastCartId;
    while (existingCarts.some((cart) => cart.id === newCartId)) {
      newCartId++;
    }
    return newCartId;
  }

  async getCarts() {
    const cart = await fsPromises.readFile(cartFilePath, "utf-8");
    return JSON.parse(cart);
  }

  async addCarts() {
    let existingCarts = [];

    try {
      const existingCartsData = await fs.readFile(cartFilePath, "utf-8");
      existingCarts = JSON.parse(existingCartsData);
    } catch (error) {
      console.log(error);
    }

    const newCartId = UniqueId(existingCarts);
    const newCart = {
      id: newCartId,
      products: [],
    };

    existingCarts.push(newCart);

    await fs.writeFile(cartFilePath, JSON.stringify(existingCarts, null, 2));
  }
  async getCartsById(id) {
    const carts = await this.getProductos();

    if (!carts[id]) {
      return "carrito No encontrado";
    }

    const productFind = carts[id];

    await fsPromises.writeFile(cartFilePath, JSON.stringify(carts, null, "\t"));

    return productFind;
  }
}
