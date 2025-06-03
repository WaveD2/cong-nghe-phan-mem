import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ShoppingBag, Zap, Truck } from 'lucide-react';
import { useProducts } from '../context/productContext';
import ProductCard from '../components/products/productCard';
import ProductSkeleton from '../components/skeleton/product-skeleton';

const categories = [
  { name: 'Điện thoại', value: 'smartphones' },
  { name: 'Laptop', value: 'laptops' },
  { name: 'Đồng hồ', value: 'mens-watches' },
  { name: 'Máy tính bảng', value: 'tablets' },
];
const Home = () => {
  const { getHomeProducts, loading, setLoading, error } = useProducts();
  const [allCategories, setAllCategories] = useState({
    smartphones: [],
    laptops: [],
    watches: [],
    tablets: [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const updatedCategories = {};
        for (let { value } of categories) {
          const response = await getHomeProducts(value);
          if (response?.success && response?.data?.length > 0) {
            updatedCategories[value] = response.data;
          }
        }
        setAllCategories(updatedCategories);
      } catch (err) {
        toast.error('Lỗi khi tải sản phẩm: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [getHomeProducts, setLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner chính */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-blue-600 via-purple-500 to-teal-400 text-white py-16 md:py-24"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Chào mừng đến với WAVED
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg md:text-xl mb-8"
          >
            Khám phá các sản phẩm công nghệ giá tốt nhất
          </motion.p>
          <Link to="/store">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-opacity-90 transition duration-300"
            >
              Mua sắm ngay
            </motion.button>
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: ShoppingBag, title: 'Lựa chọn đa dạng', desc: 'Tìm sản phẩm công nghệ phù hợp' },
              { icon: Zap, title: 'Giao hàng nhanh', desc: 'Nhận hàng trong thời gian ngắn' },
              { icon: Truck, title: 'Đổi trả dễ dàng', desc: 'Chính sách đổi trả trong 30 ngày' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 + idx * 0.2, duration: 0.5 }}
                className="flex items-center bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm"
              >
                <item.icon className="w-10 h-10 mr-4" />
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Danh mục */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-gray-100 py-12"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(({ name, value }) => (
              <Link to={`/store?category=${value}`} key={value}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-lg shadow-md md:py-5 p-2 text-center hover:shadow-lg transition duration-300 cursor-pointer"
                >
                  <h3 className="font-semibold text-lg">{name}</h3>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sản phẩm theo danh mục */}
      <AnimatePresence>
        {Object.keys(allCategories).map((category) => (
          <motion.div
            key={category}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 py-12"
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">
                {categories.find((c) => c.value === category)?.name}
              </h2>
              <div
                className={
                  error
                    ? 'flex justify-center items-center'
                    : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                }
              >
                {error && (
                  <p className="text-red-500 text-center col-span-full">
                    Đã xảy ra lỗi khi tải sản phẩm!
                  </p>
                )}

                {loading &&
                  Array.from({ length: 4 }).map((_, idx) => (
                    <ProductSkeleton key={idx} />
                  ))}

                {!loading &&
                  !error &&
                  (allCategories[category] || []).slice(0, 4).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default Home;