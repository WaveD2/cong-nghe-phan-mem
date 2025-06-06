
import { useState } from "react"
import { useProducts } from "../../context/productContext"
import LoadingComponent from "../../components/helper/loadingComponent"
import { Save, UploadCloud } from "lucide-react";
import Select from "react-select";
import { motion } from "framer-motion";
import { CATEGORIES } from "../../constant";
import ImageUpload from "../../components/helper/image";


function CreateProductForm() {
  const { adminCreateProduct, loading } = useProducts()
  const [errors, setErrors] = useState({})
  const [product, setProduct] = useState({
    title: "",
    brand: "",
    category: "",
    price: "",
    stock: "",
    discountPercentage: "",
    description: "",
  })

  const [thumbnailPreview, setThumbnailPreview] = useState([""]);
  const [images, setImages] = useState([""]);


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProduct((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!product.title.trim()) newErrors.title = "Tên sản phẩm là bắt buộc"
    else if (product.title.length < 3) newErrors.title = "Tên sản phẩm phải có ít nhất 3 ký tự"

    if (!product.brand.trim()) newErrors.brand = "Thương hiệu là bắt buộc"
    if (!product.category.trim()) newErrors.category = "Danh mục là bắt buộc"

    if (!product.description.trim()) newErrors.description = "Mô tả là bắt buộc"
    else if (product.description.length < 20) newErrors.description = "Mô tả phải ít nhất 20 ký tự"

    if (product.price && isNaN(Number(product.price))) newErrors.price = "Giá phải là số"
    if (product.stock && isNaN(Number(product.stock))) newErrors.stock = "Tồn kho phải là số"
    if (product.discountPercentage && isNaN(Number(product.discountPercentage))) newErrors.discountPercentage = "Giảm giá phải là số"

    if (product.thumbnail && !isValidUrl(product.thumbnail)) newErrors.thumbnail = "Đường dẫn hình ảnh không hợp lệ"

    return newErrors
  }

  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    const productData = {
      ...product,
      price: Number(product.price),
      stock: Number(product.stock),
      discountPercentage: Number(product.discountPercentage),
    }

    try {
      await adminCreateProduct(productData)
      alert("Tạo sản phẩm thành công!")
      setProduct({
        title: "",
        brand: "",
        category: "",
        price: "",
        stock: "",
        discountPercentage: "",
        description: "",
        thumbnail: "",
        availabilityStatus: "in_stock",
        warranty: "",
        shippingInformation: "",
        returnPolicy: "",
      })
      setErrors({})
    } catch (error) {
      alert("Tạo sản phẩm thất bại. Vui lòng thử lại." ,error)
    }
  }
 

  const handleCategoryChange = (selectedOption) => {
    setProduct((prev) => ({ ...prev, category: selectedOption.value }));
  };

  if (loading) return <LoadingComponent />

  return (
    <motion.div
      className="container mx-auto p-6 bg-white shadow-lg rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Chỉnh sửa sản phẩm</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Tên sản phẩm
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={product.title}
              onChange={handleInputChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              Nhãn hàng
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={product.brand}
              readOnly
              className="w-full mt-2 p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Danh mục
            </label>
            <Select
              options={CATEGORIES}
              defaultValue={CATEGORIES.find((opt) => opt.value === product.category)}
              onChange={handleCategoryChange}
              className="w-full mt-2 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Giá gốc (VNĐ)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={product.price}
              onChange={handleInputChange}
              min="0"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              placeholder="VD: 1000000"
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
              Số lượng trong kho
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={product.stock}
              onChange={handleInputChange}
              min="0"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              placeholder="VD: 50"
            />
          </div>

          <div>
            <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700">
              Giá bán sau giảm
            </label>
            <input
              type="number"
              id="discountedPrice"
              name="discountedPrice"
              value={product.discountedPrice}
              onChange={handleInputChange}
              min="0"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              placeholder="VD: 900000"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Mô tả sản phẩm
          </label>
          <textarea
            id="description"
            name="description"
            value={product.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md resize-none"
            placeholder="Mô tả chi tiết sản phẩm..."
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
          <div className="flex items-center mt-2 gap-4">
            <UploadCloud className="w-4 h-4" />
              <ImageUpload images={product?.thumbnail || thumbnailPreview} maxImages={1} defaultValue={product.thumbnail || thumbnailPreview} setImages={setThumbnailPreview}/>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ảnh</label>
          <div className="flex items-center mt-2 gap-4">
            <UploadCloud className="w-4 h-4" />
              <ImageUpload images={product.images || images} maxImages={5} defaultValue={product.images || images} setImages={setImages}/>
          </div>
        </div>

       <div className="flex items-center justify-end w-full">
       <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          className="gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md transition mt-4"
        >
          <Save className="w-5 h-5 inline-block" />
          <span> Cập nhật sản phẩm</span>
        </motion.button>
       </div>
      </form>
    </motion.div>
  )
}

export default CreateProductForm
