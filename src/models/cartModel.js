import mongoose from "mongoose";

const cartCollection = "cart";

const productSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
  },
  quantity: Number,
});

const cartSchema = mongoose.Schema({
  products: [productSchema],
});

const cartModel = mongoose.model(cartCollection, cartSchema);

export { cartModel };
