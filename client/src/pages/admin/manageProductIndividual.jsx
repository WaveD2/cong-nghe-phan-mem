
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useProducts } from "../../context/productContext"
import LoadingComponent from "../../components/helper/loadingComponent"
import { Save, UploadCloud } from "lucide-react";
import Select from "react-select";
import { motion } from "framer-motion";
import { CATEGORIES } from "../../constant";
import ImageUpload from "../../components/helper/image";


function ManageProductIndividual() {
  const { id } = useParams()
  const { getProductById, adminProductUpdate, loading } = useProducts()
  const [product, setProduct] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState([""]);
  const [images, setImages] = useState([""]);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await getProductById(id)
        setProduct(result.data)
      } catch (error) {
        console.error("Error fetching product:", error)
      }
    }

    fetchProduct()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProduct((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await adminProductUpdate(id, product)
      alert("Product updated successfully!")
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Failed to update product. Please try again.")
    }
  }

  const handleCategoryChange = (selectedOption) => {
    setProduct((prev) => ({ ...prev, category: selectedOption.value }));
  };

  if (loading) return <LoadingComponent />
  if (!product) return <div>Không tìm thấy sản phẩm</div>
  console.log("product", product);
  
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
              onChange={handleInputChange}
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

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
            <div className="flex items-center mt-2 gap-4">
              <UploadCloud className="w-6 h-6 text-blue-400" />
                <ImageUpload   maxImages={1} imagesDefault={[product.thumbnail]} setImages={setThumbnailPreview}/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ảnh</label>
            <div className="flex items-center mt-2 gap-4">
              <UploadCloud className="w-6 h-6 text-blue-400" />
                <ImageUpload  maxImages={5} imagesDefault={product.images || images} setImages={setImages}/>
            </div>
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

export default ManageProductIndividual
