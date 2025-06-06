import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import { motion } from "framer-motion"

function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">📊 Bảng Điều Khiển Quản Trị</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Người dùng" value="1.234" icon={<Users className="text-blue-500" />} />
        <DashboardCard title="Đơn hàng" value="567" icon={<ShoppingCart className="text-green-500" />} />
        <DashboardCard title="Doanh thu" value="89.012₫" icon={<DollarSign className="text-yellow-500" />} />
        <DashboardCard title="Tăng trưởng" value="+12,5%" icon={<TrendingUp className="text-red-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  )
}

function DashboardCard({ title, value, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-gray-700">{title}</h2>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </motion.div>
  )
}

function RecentOrders() {
  const orders = [
    { id: 101, customer: "Nguyễn Văn A", total: "1.200.000₫", status: "Hoàn tất" },
    { id: 102, customer: "Trần Thị B", total: "850.000₫", status: "Đang xử lý" },
    { id: 103, customer: "Lê Văn C", total: "2.000.000₫", status: "Đã giao" },
    { id: 104, customer: "Phạm Thị D", total: "620.000₫", status: "Chờ xác nhận" },
    { id: 105, customer: "Đỗ Văn E", total: "3.100.000₫", status: "Hoàn tất" },
    { id: 106, customer: "Võ Thị F", total: "1.150.000₫", status: "Đã huỷ" },
    { id: 107, customer: "Ngô Văn G", total: "780.000₫", status: "Hoàn tất" },
    { id: 108, customer: "Bùi Thị H", total: "950.000₫", status: "Đang xử lý" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white p-6 rounded-2xl shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4">🧾 Đơn hàng gần đây</h2>
      <div className="overflow-y-auto max-h-96 scroll-smooth">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2 text-left">Mã đơn</th>
              <th className="py-2 text-left">Khách hàng</th>
              <th className="py-2 text-left">Tổng tiền</th>
              <th className="py-2 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-2">{order.id}</td>
                <td className="py-2">{order.customer}</td>
                <td className="py-2">{order.total}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === "Hoàn tất"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Đã giao"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "Đang xử lý"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "Đã huỷ"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function TopProducts() {
  const products = [
    { id: 1, name: "iPhone 14 Pro Max", sales: 230 },
    { id: 2, name: "MacBook Air M2", sales: 180 },
    { id: 3, name: "Tai nghe Sony WH-1000XM5", sales: 145 },
    { id: 4, name: "Samsung Galaxy S23", sales: 130 },
    { id: 5, name: "Apple Watch Series 9", sales: 120 },
    { id: 6, name: "Logitech MX Master 3S", sales: 110 },
    { id: 7, name: "Asus ROG Zephyrus", sales: 95 },
    { id: 8, name: "Chuột Razer Viper V2 Pro", sales: 90 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white p-6 rounded-2xl shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4">🔥 Sản phẩm bán chạy</h2>
      <div className="overflow-y-auto max-h-96 scroll-smooth">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2 text-left">STT</th>
              <th className="py-2 text-left">Sản phẩm</th>
              <th className="py-2 text-left">Số lượng bán</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{product.name}</td>
                <td className="py-2 font-bold">{product.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default AdminDashboard
