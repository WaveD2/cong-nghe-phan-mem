import  { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaUsersCog } from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";
import Breadcrumb from "../../components/helper/breadcrumbs";
import { MdManageHistory } from "react-icons/md";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";


function AdminLayout() {
  const [isFixed, setIsFixed] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const logicFunction = () => {
      const scrollY = window.innerHeight + window.scrollY;
      const wholeHeight = document.documentElement.scrollHeight;
      const heightForHiding = wholeHeight - 160;
      setIsFixed(scrollY < heightForHiding);
    };

    const reponsiveFunction = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("scroll", logicFunction);
    window.addEventListener("resize", reponsiveFunction);

    return () => {
      window.removeEventListener("scroll", logicFunction);
      window.removeEventListener("resize", reponsiveFunction);
    };
  }, []);

  return (
    <div className="grid min-h-screen">
     
      <div
        className={`text-black p-5 border-r-2 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        } ${isFixed ? "fixed" : "absolute"}`}
      >
        <button
          className="flex justify-end w-full mb-5"
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
          }}
        >
          {!isSidebarOpen ? "X" : "☰"}
        </button>

        <h2 className="text-xl font-bold mb-4">
          {!isSidebarOpen ? (
            <MdAdminPanelSettings />
          ) : (
            "Quản lý"
          )}
        </h2>

        <ul className="space-y-5">
          
          <li>
            <NavLink
              to="/dashboard/admin"
              end
              className={({ isActive }) => (isActive ? "text-blue-500" : "text-black")}
            >
              {!isSidebarOpen ? (
                <MdDashboardCustomize />
              ) : (
                "Thống kê"
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/admin/products"
              className={({ isActive }) => (isActive ? "text-blue-500" : "text-black")}
            >
              {!isSidebarOpen ? (
                <MdOutlineProductionQuantityLimits />
              ) : (
                "Quản lý sản phẩm"
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/admin/users"
              className={({ isActive }) => (isActive ? "text-blue-500" : "text-black")}
            >
              {!isSidebarOpen ? (
                <FaUsersCog />
              ) : (
                "Quản lý người dùng"
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/admin/orders"
              className={({ isActive }) => (isActive ? "text-blue-500" : "text-black")}
            >
              {!isSidebarOpen ? (
                <MdManageHistory />
              ) : (
                "Quản lý đặt hàng"
              )}
            </NavLink>
          </li>
        </ul>
      </div>

      <div
        className={`p-5 transition-all duration-300 ${isSidebarOpen ? "ml-[250px]" : "ml-[80px]"}`}
      >
        <Breadcrumb   />
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
