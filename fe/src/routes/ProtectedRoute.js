import React from "react";
import useAuth from "../custom-hook/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const currentUser = useAuth();
  console.log(currentUser);

  useEffect(() => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập !");
      return;
    }
  }, [currentUser]);

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
