import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ImageGallery from "./ImageGallery";
import AddToCartButton from "./AddToCartButton";
import { useProducts } from "../../../context/productContext";
import Breadcrumb from "../../helper/breadcrumbs";
import LoadingComponent from "../../helper/loadingComponent";
import { formatCurrencyVND } from "../../../hepler";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { id } = useParams();
  const { getProductById, getHomeProducts, loading } = useProducts();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch product details
      const foundProduct = await getProductById(id);
      setProduct(foundProduct.data);

      // Fetch related products (assuming same category or similar logic)
      const products = await getHomeProducts();
      console.log("Fetched products:", products.data);
      
      const related = products.data
        .filter((p) => p._id !== id && p.category === foundProduct.data.category)
        .slice(0, 4); // Limit to 4 related products
      setRelatedProducts(related);
    };

    fetchData();
  }, [id]);

  if (loading || !product) return <LoadingComponent />;


    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6" title={product.title} />
  
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Image Section */}
          <div className="flex justify-center items-center">
            <ImageGallery
              images={product.images?.length > 0 ? product.images : [product.thumbnail]}
              className="w-full max-w-md rounded-lg overflow-hidden"
            />
          </div>
  
          {/* Product Info Section */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {product.title}
              </h1>
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold">Nhãn hàng:</span> {product.brand} |{' '}
                <span className="font-semibold">Loại:</span> {product.category}
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <p className="text-gray-400 line-through text-lg">
                  {formatCurrencyVND(product.price)}
                </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrencyVND(product.discountedPrice)}
                  </p>
                {product.discount > 0 && (
                  <span className="text-sm text-red-500 font-semibold">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Số lượng:</span>  {product.stock}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">SKU:</span> {product.sku}
                </p>
              </div>
              {product.tags?.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2 mt-4">
                  <p className="text-sm text-gray-600 font-semibold">Tags:</p>
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <AddToCartButton
              productId={product._id ?? ''}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mt-6"
              disabled={product.stock === 0}
            />
          </div>
        </div>
  
        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Sản phẩm bạn có thể thích
          </h2>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={relatedProduct.thumbnail}
                    alt={relatedProduct.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {relatedProduct.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {formatCurrencyVND(relatedProduct.price)}
                  </p>
                  <a
                    href={`/product/${relatedProduct._id}`}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Xem chi tiết
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Không có sản phẩm liên quan.</p>
          )}
        </div>
      </div>
    );
};

export default ProductDetails;