class ProductDTO {
  constructor(id, title, description, price, code, stock, owner) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.code = code;
    this.stock = stock;
    this.owner = owner; 
  }

  static createFromModel(productModel) {
    return new ProductDTO(
      productModel._id,
      productModel.title,
      productModel.description,
      productModel.price,
      productModel.code,
      productModel.stock,
      productModel.owner 
    );
  }
}

export { ProductDTO };
