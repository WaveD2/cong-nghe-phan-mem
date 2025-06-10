import { useState } from "react"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import apiClient from "../../helper/axios"
import { useToast } from "../../../context/toastContext"
import { useAuth } from "../../../context/authContext"
import { useNavigate } from "react-router-dom"

const AddToCartButton = ({ productId, onAddToCart }) => {
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const incrementQuantity = () => setQuantity((prev) => Math.min(prev + 1, 99))
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1))

  const handleAddToCart = async () => {
    if (!user) {
      setShowModal(true)
      return
    }
    setIsAdding(true)
    try {
      console.log("productId", productId)
      const response = await apiClient.post('/api/cart-service', { id: productId, quantity })
      console.log(response.data)
      showToast(response.data.message, "success")
      onAddToCart?.()
    } catch (error) {
      console.error(error)
      if (error.response?.status === 401) {
        setShowModal(true)
      } else {
        showToast(error.response?.data?.message || "Error adding to cart", "error")
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleLoginRedirect = () => {
    // Store current location to redirect back after login
    const currentPath = window.location.pathname
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  return (
    <>
      <div className="flex items-center w-full justify-between space-x-3">
        <div className="flex items-center border border-gray-200 rounded-full shadow-sm bg-white">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={decrementQuantity}
            disabled={isAdding}
          >
            <Minus className="h-4 w-4 text-gray-600" />
            <span className="sr-only">Giảm</span>
          </button>
          <span className="w-12 text-center font-medium text-gray-800">{quantity}</span>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={incrementQuantity}
            disabled={isAdding}
          >
            <Plus className="h-4 w-4 text-gray-600" />
            <span className="sr-only">Tăng</span>
          </button>
        </div>
        <button
          className="flex flex-1 items-center justify-center gap-2 text-sm font-medium rounded-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          <ShoppingCart className="h-5 w-5" />
          <span style={{ textTransform: "none" }}>
            {isAdding ? "Đang xử lý..." : "Thêm vào giỏ"}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Vui lòng đăng nhập
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  onClick={handleLoginRedirect}
                >
                  Đăng nhập
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AddToCartButton