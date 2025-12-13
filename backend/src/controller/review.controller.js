import Review from "../models/review.js";
import Product from "../models/product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

// Import Product model (đã có ở trên)

// 🟢 Tạo đánh giá mới (sau khi mua hàng)
export const createReview = async (req, res) => {
  try {
    const { product_id, product_variant_id, rating, comment, images, videos } = req.body;
    const user_id = req.user._id; // lấy từ middleware verifyToken

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    // Kiểm tra user đã mua sản phẩm này chưa (đơn hàng đã thanh toán - payment_status = "paid")
    const hasPurchased = await Order.findOne({
      user_id,
      payment_status: "paid",
      "items.product_id": product_id
    });

    if (!hasPurchased) {
      return res.status(403).json({ 
        message: "Bạn cần mua và thanh toán sản phẩm này trước khi đánh giá" 
      });
    }

    // Kiểm tra user đã đánh giá chưa (cho cùng product và variant)
    const existing = await Review.findOne({ 
      product_id, 
      user_id,
      ...(product_variant_id && { product_variant_id })
    });
    if (existing) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    }

    const review = new Review({ 
      product_id, 
      product_variant_id: product_variant_id || null,
      user_id, 
      rating, 
      comment,
      images: images || [],
      videos: videos || [],
      likes: []
    });
    await review.save();

    // Populate để trả về thông tin đầy đủ
    await review.populate("user_id", "name email avatar");
    if (review.product_variant_id) {
      await review.populate("product_variant_id", "color size variant_name");
    }

    res.status(201).json({ message: "Đánh giá thành công", review });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo đánh giá", error: error.message });
  }
};

// 🟡 Lấy tất cả đánh giá của 1 sản phẩm với lọc (chỉ hiển thị đánh giá không bị ẩn)
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      star,           // Lọc theo số sao (1-5)
      hasComment,     // Chỉ lấy đánh giá có bình luận
      hasMedia        // Chỉ lấy đánh giá có hình/video
    } = req.query;

    // Xây dựng query filter (chỉ lấy đánh giá không bị ẩn)
    const filter = { product_id: productId, is_hidden: false };

    // Lọc theo số sao
    if (star && [1, 2, 3, 4, 5].includes(Number(star))) {
      filter.rating = Number(star);
    }

    // Lọc đánh giá có bình luận
    if (hasComment === 'true') {
      filter.comment = { $exists: true, $ne: "" };
    }

    // Lọc đánh giá có media (hình hoặc video)
    if (hasMedia === 'true') {
      filter.$or = [
        { images: { $exists: true, $ne: [] } },
        { videos: { $exists: true, $ne: [] } }
      ];
    }

    const reviews = await Review.find(filter)
      .populate("user_id", "name email avatar")
      .populate("product_variant_id", "color size variant_name")
      .sort({ created_at: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đánh giá", error: error.message });
  }
};

// 📊 Lấy điểm trung bình và thống kê đánh giá (chỉ tính đánh giá không bị ẩn)
export const getReviewStatistics = async (req, res) => {
  try {
    const { productId } = req.params;

    // Tính điểm trung bình (chỉ đánh giá không bị ẩn)
    const avgResult = await Review.aggregate([
      { $match: { product_id: new mongoose.Types.ObjectId(productId), is_hidden: false } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
    ]);

    const averageRating = avgResult.length > 0 ? avgResult[0].avgRating : 0;
    const totalReviews = avgResult.length > 0 ? avgResult[0].totalReviews : 0;

    // Thống kê theo số sao (chỉ đánh giá không bị ẩn)
    const starStats = await Review.aggregate([
      { $match: { product_id: new mongoose.Types.ObjectId(productId), is_hidden: false } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    // Tạo object với key là số sao (1-5)
    const starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    starStats.forEach(stat => {
      starDistribution[stat._id] = stat.count;
    });

    res.json({
      averageRating: Math.round(averageRating * 10) / 10, // Làm tròn 1 chữ số
      totalReviews,
      starDistribution
    });
  } catch (error) {
    // Nếu không dùng ObjectId, thử cách khác
    try {
      const reviews = await Review.find({ product_id: productId, is_hidden: false });
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      const starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(review => {
        starDistribution[review.rating]++;
      });

      res.json({
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        starDistribution
      });
    } catch (fallbackError) {
      res.status(500).json({ 
        message: "Lỗi khi lấy thống kê đánh giá", 
        error: fallbackError.message 
      });
    }
  }
};

// 👍 Like/Unlike đánh giá
export const toggleLikeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user_id = req.user._id || req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    const likedIndex = review.likes.findIndex(
      id => id.toString() === user_id.toString()
    );

    let action = "";
    if (likedIndex > -1) {
      // Unlike
      review.likes.splice(likedIndex, 1);
      action = "unliked";
    } else {
      // Like
      review.likes.push(user_id);
      action = "liked";
    }

    await review.save();

    res.json({ 
      message: `Đã ${action === 'liked' ? 'thích' : 'bỏ thích'} đánh giá`,
      action,
      likesCount: review.likes.length 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi like đánh giá", error: error.message });
  }
};

// ✅ Kiểm tra user có thể đánh giá sản phẩm không
export const checkCanReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const user_id = req.user._id;

    // Kiểm tra user đã mua sản phẩm này chưa (đơn hàng đã thanh toán)
    const hasPurchased = await Order.findOne({
      user_id,
      payment_status: "paid",
      "items.product_id": productId
    });

    // Kiểm tra user đã đánh giá chưa
    const hasReviewed = await Review.findOne({
      product_id: productId,
      user_id
    });

    res.json({
      canReview: !!hasPurchased && !hasReviewed,
      hasPurchased: !!hasPurchased,
      hasReviewed: !!hasReviewed,
      message: !hasPurchased 
        ? "Bạn cần mua và thanh toán sản phẩm này trước khi đánh giá"
        : hasReviewed
        ? "Bạn đã đánh giá sản phẩm này rồi"
        : "Bạn có thể đánh giá sản phẩm này"
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi kiểm tra quyền đánh giá", error: error.message });
  }
};

// 📦 Lấy danh sách sản phẩm đã mua (đã thanh toán) và chưa đánh giá
export const getPurchasedProductsForReview = async (req, res) => {
  try {
    const user_id = req.user._id;

    console.log('🔍 Getting purchased products for user:', user_id);

    // Lấy tất cả đơn hàng đã thanh toán của user
    const paidOrders = await Order.find({
      user_id,
      payment_status: "paid"
    }).lean(); // Dùng lean() để có object thuần, dễ xử lý hơn

    console.log('📦 Found paid orders:', paidOrders.length);

    if (paidOrders.length === 0) {
      return res.json({
        products: [],
        total: 0,
        message: "Bạn chưa có đơn hàng đã thanh toán"
      });
    }

    // Lấy tất cả sản phẩm đã được user đánh giá
    const reviewedProducts = await Review.find({ user_id }).distinct("product_id");
    const reviewedProductIds = reviewedProducts.map(id => id.toString());
    console.log('⭐ Reviewed product IDs:', reviewedProductIds);

    // Lấy tất cả product IDs từ orders (unique)
    const uniqueProductIds = new Set();
    paidOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          let productId = item.product_id;
          // Handle ObjectId object
          if (productId && typeof productId === 'object') {
            productId = productId._id || productId.toString();
          }
          if (productId) {
            uniqueProductIds.add(productId.toString());
          }
        });
      }
    });
    
    console.log('📋 Unique product IDs:', Array.from(uniqueProductIds));

    // Populate products một lần
    const productsMap = new Map();
    if (uniqueProductIds.size > 0) {
      try {
        const productIdsArray = Array.from(uniqueProductIds).map(id => {
          try {
            return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
          } catch {
            return id;
          }
        });
        
        const products = await Product.find({ _id: { $in: productIdsArray } });
        products.forEach(product => {
          productsMap.set(product._id.toString(), {
            _id: product._id,
            name: product.name,
            images: product.images || [],
            price: product.price
          });
        });
        console.log('📦 Populated products:', products.length);
      } catch (populateError) {
        console.error('Error populating products:', populateError);
        // Tiếp tục với dữ liệu từ item nếu populate thất bại
      }
    }

    // Lọc sản phẩm đã mua nhưng chưa đánh giá
    const purchasedProductsMap = new Map();

    paidOrders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;
      
      order.items.forEach(item => {
        // Với lean(), product_id là ObjectId thuần
        let rawProductId = item.product_id;
        
        // Handle cả trường hợp ObjectId object hoặc string
        if (rawProductId && typeof rawProductId === 'object') {
          rawProductId = rawProductId._id || rawProductId.toString();
        }
        
        if (!rawProductId) {
          console.warn('⚠️ Item missing product_id:', item);
          return;
        }

        const productId = rawProductId.toString();

        // Bỏ qua sản phẩm đã đánh giá
        if (reviewedProductIds.includes(productId)) {
          return;
        }

        // Chỉ thêm mỗi sản phẩm một lần
        if (!purchasedProductsMap.has(productId)) {
          // Lấy product từ map hoặc dùng data từ item
          const productData = productsMap.get(productId);
          
          // Nếu không có trong map, dùng data từ item (fallback)
          const finalProduct = productData || {
            _id: productId,
            name: item.name || 'Sản phẩm',
            images: item.image ? [item.image] : [],
            price: item.price || 0
          };

          purchasedProductsMap.set(productId, {
            product_id: productId,
            product: {
              _id: finalProduct._id || productId,
              name: finalProduct.name || item.name || 'Sản phẩm',
              images: (finalProduct.images && finalProduct.images.length > 0)
                ? finalProduct.images 
                : (item.image ? [item.image] : []),
              price: finalProduct.price || item.price || 0
            },
            order_id: order._id,
            order_number: order.order_number || `ORDER-${order._id}`,
            purchased_date: order.created_at || order.updated_at || new Date(),
            quantity: item.quantity || 1
          });
        }
      });
    });

    // Chuyển Map thành Array
    const productsToReview = Array.from(purchasedProductsMap.values());

    console.log('✅ Products to review:', productsToReview.length);

    res.json({
      products: productsToReview,
      total: productsToReview.length,
      success: true
    });
  } catch (error) {
    console.error('❌ Error in getPurchasedProductsForReview:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: "Lỗi khi lấy danh sách sản phẩm đã mua", 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// 🟣 Admin hoặc user có thể xóa review của chính mình
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user._id || req.user.id;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    if (review.user_id.toString() !== user_id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Không có quyền xóa đánh giá này" });

    await review.deleteOne();
    res.json({ message: "Đã xóa đánh giá thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa đánh giá", error: error.message });
  }
};

// ==================== ADMIN APIs ====================

// 📋 Admin: Lấy tất cả đánh giá với lọc và phân trang
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      rating,
      is_hidden,
      product_id,
      user_id,
      search,
      sortBy = "created_at",
      sortOrder = "desc"
    } = req.query;

    // Xây dựng filter
    const filter = {};

    if (rating && [1, 2, 3, 4, 5].includes(Number(rating))) {
      filter.rating = Number(rating);
    }

    if (is_hidden !== undefined) {
      filter.is_hidden = is_hidden === "true";
    }

    if (product_id) {
      filter.product_id = product_id;
    }

    if (user_id) {
      filter.user_id = user_id;
    }

    // Tìm kiếm theo comment
    if (search) {
      filter.comment = { $regex: search, $options: "i" };
    }

    // Phân trang
    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Đếm tổng số
    const total = await Review.countDocuments(filter);

    // Lấy dữ liệu
    const reviews = await Review.find(filter)
      .populate("product_id", "name images")
      .populate("user_id", "name email avatar")
      .populate("product_variant_id", "color size variant_name")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đánh giá", error: error.message });
  }
};

// 👁️ Admin: Ẩn/Hiện đánh giá
export const toggleReviewVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_hidden } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    review.is_hidden = is_hidden === true || is_hidden === "true";
    review.updated_at = new Date();
    await review.save();

    res.json({
      message: `Đã ${review.is_hidden ? "ẩn" : "hiện"} đánh giá thành công`,
      review
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái đánh giá", error: error.message });
  }
};

// 🗑️ Admin: Xóa đánh giá (hard delete)
export const adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    await review.deleteOne();
    res.json({ message: "Đã xóa đánh giá thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa đánh giá", error: error.message });
  }
};

// 📊 Admin: Thống kê đánh giá
export const getReviewStatisticsAdmin = async (req, res) => {
  try {
    const { product_id, user_id } = req.query;

    const filter = {};
    if (product_id) filter.product_id = product_id;
    if (user_id) filter.user_id = user_id;

    // Tổng số đánh giá
    const totalReviews = await Review.countDocuments(filter);

    // Đánh giá bị ẩn
    const hiddenReviews = await Review.countDocuments({ ...filter, is_hidden: true });

    // Điểm trung bình
    const avgResult = await Review.aggregate([
      { $match: filter },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const averageRating = avgResult.length > 0 ? avgResult[0].avgRating : 0;

    // Phân bố theo sao
    const starStats = await Review.aggregate([
      { $match: filter },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    starStats.forEach(stat => {
      starDistribution[stat._id] = stat.count;
    });

    // Đánh giá có hình/video
    const reviewsWithMedia = await Review.countDocuments({
      ...filter,
      $or: [
        { images: { $exists: true, $ne: [] } },
        { videos: { $exists: true, $ne: [] } }
      ]
    });

    res.json({
      totalReviews,
      hiddenReviews,
      visibleReviews: totalReviews - hiddenReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      starDistribution,
      reviewsWithMedia,
      reviewsWithoutMedia: totalReviews - reviewsWithMedia
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thống kê đánh giá", error: error.message });
  }
};
