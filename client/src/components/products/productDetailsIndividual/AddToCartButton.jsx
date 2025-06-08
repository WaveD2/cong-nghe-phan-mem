import { useState } from "react"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import apiClient from "../../helper/axios"
import { useToast } from "../../../context/toastContext"

const AddToCartButton = ({ productId, onAddToCart }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { showToast } = useToast()

  const incrementQuantity = () => setQuantity((prev) => Math.min(prev + 1, 99))
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1))

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      console.log("productId", productId)
      const response = await apiClient.post('/api/cart-service', { id: productId, quantity })
      console.log(response.data)
      showToast(response.data.message, "success")
    } catch (error) {
      console.error(error)
      if (error.response.status === 401) return alert("Please Login First!!!")
      return showToast(error.response.data.message, "error")
    } finally {
      setIsAdding(false)
    }
  }

  return (
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
  )
}

export default AddToCartButton