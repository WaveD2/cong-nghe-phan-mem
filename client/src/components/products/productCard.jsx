import { useNavigate } from "react-router-dom";
import { formatCurrencyVND } from "../../hepler";
import AddToCartButton from "./productDetailsIndividual/AddToCartButton";
import { Heart } from "lucide-react";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/store/${product?._id}`);
  };

  const truncateDescription = (description, wordLimit = 15) => {
    if (description) {
      const words = description.split(" ");
      return words.length > wordLimit
        ? words.slice(0, wordLimit).join(" ") + "..."
        : description;
    }
    return "";
  };

  return (
    <div
      onClick={handleProductClick}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer w-full max-w-sm"
    >
      {/* Badge giảm giá */}
      {product?.discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
          -{product.discount}%
        </div>
      )}

      {/* Icon yêu thích (demo UI) */}
      <div className="absolute top-3 right-3 z-10 text-gray-500 hover:text-red-500 transition">
        <Heart size={18} />
      </div>

      {/* Ảnh sản phẩm */}
      <img
        src={product?.thumbnail}
        alt={product?.title}
        className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
      />

      {/* Nội dung */}
      <div className="p-4 flex flex-col justify-between h-[220px]">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {product?.title}
        </h3>

        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {truncateDescription(product?.description)}
        </p>

        {/* Giá */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-400 line-through">
            {formatCurrencyVND(product?.price)}
          </span>
          <span className="text-lg font-bold text-green-600">
            {formatCurrencyVND(product?.discountedPrice)}
          </span>
        </div>

        {/* Nút thêm giỏ hàng */}
        <div onClick={(e) => e.stopPropagation()} className="mt-4">
          <AddToCartButton productId={product?._id} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
