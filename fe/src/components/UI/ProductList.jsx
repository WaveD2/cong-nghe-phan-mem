import React from "react";
import ProductCard from "./ProductCard";

const ProductList = ({ data, isBtn }) => {
  return (
    <>
      {data?.map((item, index) => (
        <ProductCard item={item} key={index} />
      ))}
      <iv className="w-100 d-flex justify-content-center">
      {isBtn && (
        <button
          type="button"
          className=" btn btn-outline-primary mt-5 "
          style={{ width: "150px" }}>
          Xem thêm
        </button>
      )}
      </iv>
    </>
  );
};

export default ProductList;
