import React from "react";
import Header from "../Header/Header.jsx";
import Routers from "../../routes/Router.js";
import Footer from "../Footer/Footer.jsx";

import AdminNav from "../../admin/AdminNav.jsx";
import { useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();

  return (
    <>
      {location.pathname.startsWith("/dashboard") ? <AdminNav /> : <Header />}
      <div>
        <Routers />
      </div>
      <Footer />
    </>
  );
};
export default Layout;
