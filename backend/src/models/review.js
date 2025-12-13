import mongoose from "mongoose";

const reviewschema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    product_variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", default: null }, // Phân loại (màu, size)
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }, // 1–5 sao
    comment: { type: String, trim: true },
    images: [{ type: String }], // Hình ảnh đính kèm
    videos: [{ type: String }], // Video đính kèm
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách user đã like
    is_hidden: { type: Boolean, default: false }, // Admin có thể ẩn đánh giá
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

// Index để tối ưu truy vấn
reviewschema.index({ product_id: 1, created_at: -1 });
reviewschema.index({ user_id: 1, product_id: 1 });

export default mongoose.model("Review", reviewschema);