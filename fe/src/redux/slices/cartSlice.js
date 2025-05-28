import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
const initialState = {
  cartItems: [],
  cartHeart: [],
  totalAmount: 0,
  totalQuantity: 0,
  totalHeart: 0,
};
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const newItem = action.payload;
      const existingItm = state.cartItems.find(
        (item) => item.id === newItem.id
      );
      state.totalQuantity++;
      if (!existingItm) {
        state.cartItems.push({
          id: newItem.id,
          productName: newItem.productName,
          image: newItem.image,
          price: newItem.price,
          quantityProduct: 1,
          totalPrice: newItem.price,
        });

        toast.success("Thêm vào giỏ hàng thành công !");
      } else {
        existingItm.quantityProduct++;
        existingItm.totalPrice =
          Number(existingItm.totalPrice) + Number(newItem.price);
      }
      state.totalAmount = state.cartItems.reduce(
        (total, item) =>
          total + Number(item.price) * Number(item.quantityProduct),
        0
      );
    },
    addHeart: (state, action) => {
      const newItem = action.payload;
      const existingItm = state.cartHeart.some(
        (item) => item.id === newItem.id
      );
      if (!existingItm) {
        state.totalHeart++;
        state.cartHeart.push({
          ...newItem,
        });
        toast.success("Thêm vào sản phẩm yêu thích!");
      } else {
        toast.success("Sản phẩm đã thêm vào yêu thích!");
      }
    },

    deleteItem: (state, action) => {
      const id = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);

      if (existingItem) {
        state.cartItems = state.cartItems.filter((item) => item.id !== id);
        state.totalQuantity -= existingItem.quantity;
      }
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0
      );
    },

    deleteHeart: (state, action) => {
      console.log(action);
      const idHeart = action.payload;
      const productHeart = state.cartHeart.filter(
        (item) => item.id !== idHeart
      );
      state.cartHeart = productHeart;
      state.totalHeart--;
    },
  },
});

export const cartActions = cartSlice.actions;

const cartAction = {
  cartSlice: cartSlice.reducer,
};

export default cartAction;
