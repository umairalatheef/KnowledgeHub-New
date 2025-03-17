import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <Header />
      <main className="content">
        <Outlet /> {/* This ensures child routes (Homepage, etc.) are rendered */}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
