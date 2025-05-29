import React from "react";
import { Container, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import { db, storage } from "../firebase.config";
import { doc, deleteDoc } from "firebase/firestore";
import useGetDataFirebase from "../custom-hook/useGetDataFireBase";
import { convertVND } from "../utils/convertVND";

const AllProducts = () => {
  const { data: productData, loading } = useGetDataFirebase("products");
  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    toast.success("Delete product success");
  };
  return (
    <section>
      <Container>
        <Row>
          <Col lg="12">
            <table className="table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Số lượng</th>
                  <th>Gía tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              {loading ? (
                <h4 className="fw-bold py-5">Loading...</h4>
              ) : (
                productData.map((item, index) => (
                  <tbody key={index}>
                    <tr>
                      <td>
                        <img src={item.imgUrl} alt="img-product" />
                      </td>
                      <td>{item.title}</td>
                      <td>{item.shortDesc}</td>
                      <td>{convertVND(item.price)} đồng</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteProduct(item.id)}>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  </tbody>
                ))
              )}
            </table>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AllProducts;
