/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, FormGroup } from "reactstrap";
import { toast } from "react-toastify";
import { db, storage } from "../firebase.config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AddProducts = () => {
  const navigate = useNavigate();
  const [enterTitle, setEnterTitle] = useState("");
  const [enterShortDesc, setEnterShortDesc] = useState("");
  const [enterDescription, setEnterDescription] = useState("");
  const [enterCategory, setEnterCategory] = useState("");
  const [enterPrice, setEnterPrice] = useState("");
  const [enterProductImg, setEnterProductImg] = useState();
  const [loading, setLoading] = useState("");

  const addProduct = async (e) => {
    e.preventDefault();
    const docRef = await collection(db, "products");
    const storageRef = ref(
      storage,
      `productImages/${Date.now() + enterProductImg.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, enterProductImg);
    uploadTask.on(
      () => {
        toast.error("images not uploaded");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          addDoc(docRef, {
            title: enterTitle,
            shortDesc: enterShortDesc,
            description: enterDescription,
            category: enterCategory,
            price: enterPrice,
            imgUrl: downloadURL,
          });
        });
        toast.success("Tạo sản phẩm thành công ");
      }
    );
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="12" className="mb-5">
            {loading ? (
              <h4 className="py-5 fw-bold">Loading....</h4>
            ) : (
              <>
                <Form onSubmit={addProduct}>
                  <FormGroup className="form_group">
                    <span>Tên sản phẩm</span>
                    <input
                      required
                      type="text"
                      placeholder="VD: Váy xòe"
                      value={enterTitle}
                      onChange={(e) => setEnterTitle(e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup className="form_group">
                    <span>Số lượng sản phầm</span>
                    <input
                      required
                      type="number"
                      placeholder="VD: 10"
                      value={enterShortDesc}
                      onChange={(e) => setEnterShortDesc(e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup className="form_group">
                    <span>Mô tả sản phẩm</span>
                    <input
                      required
                      type="text"
                      placeholder="Màu sắc, chất liệu,...."
                      value={enterDescription}
                      onChange={(e) => setEnterDescription(e.target.value)}
                    />
                  </FormGroup>
                  <div className=" d-flex align-items-center  gap-5 justify-content-between">
                    <FormGroup className="form_group w-50">
                      <span>Gía tiền</span>
                      <input
                        required
                        type="number"
                        placeholder="100000"
                        value={enterPrice}
                        onChange={(e) => setEnterPrice(e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup
                      className="form_group w-50"
                      value={enterCategory}
                      onChange={(e) => setEnterCategory(e.target.value)}>
                      <span>Lựa chọn mục sản phẩm</span>
                      <select className="w-100">
                        <option value="pants">Quần</option>
                        <option value="shirt">Áo</option>
                        <option value="shoes">Gìay</option>
                        <option value="suit">Set quần && áo</option>
                        <option value="accessory">Phụ kiện</option>
                      </select>
                    </FormGroup>
                  </div>
                  <div>
                    <FormGroup className="form_group">
                      <span> Ảnh chính của sản phẩm</span>
                      <input
                        required
                        multiple
                        type="file"
                        onChange={(e) => {
                          setEnterProductImg(e.target.files[0]);
                        }}
                      />
                    </FormGroup>

                    <button className="buy_btn">Thêm sản phẩm</button>
                  </div>
                </Form>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AddProducts;
