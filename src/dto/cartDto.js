class CartDTO {
  constructor(id, products) {
    this.id = id;
    if (products) {
      this.products = products.map((product) => ({
        product: product.product,
        quantity: product.quantity,
      }));
    } else {
      this.products = [];
    }
  }

  static createFromModel(cartModel) {
    if (cartModel) {
      return new CartDTO(cartModel._id, cartModel.products);
    } else {
      return new CartDTO(null, []);
    }
  }
}

export { CartDTO };
