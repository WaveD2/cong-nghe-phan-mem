import { configureStore } from "@reduxjs/toolkit";
import cartAction from "./slices/cartSlice";
const store = configureStore({
  reducer: {
    cart: cartAction.cartSlice,
  },
});

export default store;
