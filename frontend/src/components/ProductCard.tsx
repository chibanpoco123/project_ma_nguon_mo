// src/components/ProductCard.tsx
interface ProductCardProps {
  tag: string;
  imageUrl: string;
  title: string;
  price: string;
}

function ProductCard({ tag, imageUrl, title, price }: ProductCardProps) {
  return (
    <div className="product-card">
      <span className="product-tag">{tag}</span>
      <img src={imageUrl} alt={title} className="product-card-img" />
      <div className="product-info">
        <h6 className="product-title">{title}</h6>
        <p className="product-price">{price}</p>
      </div>
    </div>
  );
}

export default ProductCard;