import React from "react";
import { Container } from "reactstrap";
import { Link } from "react-router-dom";
import CommonSection from "../../components/UI/CommonSelection";

const pageError = () => {
  return (
    <section className="mt-5">
      <CommonSection />
      <Container>
        <h2 className="text-center fw-600 my-4 text-warning bg-dark py-3 rounded fs-1">
          404
        </h2>
        <h5 className="text-center text-warning-emphasis">
          Không tìm thấy trang này !
        </h5>
        <button className="mx-auto d-block mt-5 p-2 btn btn-success fs-4">
          <Link to="home"> Quay lại về Trang Chủ</Link>
        </button>
      </Container>
    </section>
  );
};

export default pageError;
