import React from "react";
import ProductCard from "./ProductCard";

const ProductList = ({ data, isBtn }) => {
  return (
    <>
      {data?.map((item, index) => (
        <ProductCard item={item} key={index} />
      ))}
      {isBtn && (
        <button
          type="button"
          className=" btn btn-outline-primary mt-5 "
          style={{ width: "150px" }}>
          Xem thêm
        </button>
      )}
    </>
  );
};

export default ProductList;
