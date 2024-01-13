import { promises as fsPromises } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const complProductos = path.join(__dirname, "../../productos.json");

export class ProductManager {
  async addProducts(title, description, price, code, stock) {
    const existingProducts = await this.getProductos();

    const existingIds = existingProducts.map((product) => product.id);
    const maxExistingId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newProductId = maxExistingId + 1;

    const producto = {
      id: newProductId,
      title,
      description,
      price,
      code,
      stock,
    };

    try {
      if (!fsPromises.access(complProductos)) {
        const listaVacia = [];
        listaVacia.push(producto);

        await fsPromises.writeFile(
          complProductos,
          JSON.stringify(listaVacia, null, "\t")
        );
      } else {
        const productoObj = await this.getProductos();
        productoObj.push(producto);
        await fsPromises.writeFile(
          complProductos,
          JSON.stringify(productoObj, null, "\t")
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getProductos() {
    const product = await fsPromises.readFile(complProductos, "utf-8");
    return JSON.parse(product);
  }

  async updateProduct(id, nTitle, nDescription, nPrice, nCode, nStock) {
    try {
      const products = await this.getProductos();
      const productoIndex = products.findIndex(
        (producto) => producto.id === id
      );

      if (productoIndex !== -1) {
        products[productoIndex].price = nPrice;
        products[productoIndex].description = nDescription;
        products[productoIndex].title = nTitle;
        products[productoIndex].code = nCode;
        products[productoIndex].stock = nStock;

        await fsPromises.writeFile(
          complProductos,
          JSON.stringify(products, null, "\t")
        );
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("Error al actualizar el producto:", error);
      return false;
    }
  }

  async getProductsById(id) {
    const productObj = await this.getProductos();

    if (!productObj[id]) {
      return "Producto No encontrado";
    }

    const productFind = productObj[id];

    await fsPromises.writeFile(
      complProductos,
      JSON.stringify(productObj, null, "\t")
    );

    return productFind;
  }

  async deleteProduct(id) {
    const productos = await this.getProductos();

    const idxToDelete = productos.findIndex((producto) => producto.id == id);
    const deleteproduct = productos.splice(idxToDelete, 1);

    if (!deleteproduct) {
      return { success: false, message: "Id inexistente" };
    }

    try {
      await fsPromises.writeFile(
        complProductos,
        JSON.stringify(productos, null, "\t")
      );

      return { success: true, message: "Producto eliminado correctamente" };
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      return { success: false, message: "No se pudo eliminar el producto" };
    }
  }
}
