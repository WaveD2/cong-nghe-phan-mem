import { useNavigate } from "react-router-dom";
import AddToCartButton from "./productDetailsIndividual/AddToCartButton";
import { formatCurrencyVND } from "../../hepler";

const ProductCard = ({ product }) => {
  console.log("ProductCard product:", product);
  
  const truncateDescription = (description, wordLimit = 15) => {
    if(description){
      const words = description.split(" ");
      if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(" ") + "...";
      }
      return description;
    }
  };
  const navigate = useNavigate();

  const handleProductClick = () => {
    // getProductById(product?._id);
    // console.log(e.target.key)
    navigate(`/store/${product?._id}`);
  };
  return (
    <div
      key={product?._id}
      onClick={handleProductClick}
      className="bg-white shadow-lg w-[350px] md:w-full mr-5 mb-5 rounded-xl transform transition-transform duration-300 hover:scale-105 overflow-hidden relative"
    >
      {/* Badge giảm giá */}
      {product?.discount > 0 && (
        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
          -{product?.discount}%
        </span>
      )}

      {/* Thumbnail */}
      <img
        src={product?.thumbnail}
        alt={product?.title}
        className="w-full h-56 object-cover hover:opacity-90 transition-opacity duration-300 cursor-pointer" 
      />

      <div className="p-4 flex flex-col justify-between h-[260px]">
        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 ">
          {product?.title}
        </h2>

        {/* Mô tả */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {truncateDescription(product?.description)}
        </p>

        {/* Giá */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-400 line-through text-sm">
            {formatCurrencyVND(product?.price)}
          </p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrencyVND(product?.discountedPrice)}
          </p>
        </div>

        {/* Button thêm giỏ hàng */}
        <div onClick={(e) => e.stopPropagation()}>
          <AddToCartButton productId={product?._id} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
