import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  discount: Number,
  quantity: Number,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  images: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
