import { useLocation, Link } from "react-router-dom";

const breadcrumbMap = {
  dashboard: "Bảng điều khiển",
  admin: "Quản trị",
  products: "Sản phẩm",
  users: "Người dùng",
  orders: "Đơn hàng",
  edit: "Chỉnh sửa",
  create: "Tạo mới"
  // thêm các segment khác tại đây
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="mb-4 text-gray-600 text-sm">
      <ul className="flex flex-wrap items-center space-x-2">
        <li>
          <Link to="/" className="text-gray-800 hover:underline">Home</Link>
          {pathSegments.length > 0 && <span className="mx-1">/</span>}
        </li>
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          const label = breadcrumbMap[segment] || segment.replace("-", " ");

          return (
            <li key={index} className="flex items-center">
              {isLast ? (
                <span className="text-blue-500 font-semibold capitalize">{label}</span>
              ) : (
                <>
                  <Link to={path} className="text-gray-800 capitalize hover:underline">
                    {label}
                  </Link>
                  <span className="mx-1">/</span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
