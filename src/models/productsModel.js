import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productsCollection = "products";

const productsSchema = mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  code: String,
  stock: Number,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "usuarios",
    required: false,
    default: "admin",
  },
});
productsSchema.plugin(mongoosePaginate);

const productsModel = mongoose.model(productsCollection, productsSchema);

export { productsModel };
