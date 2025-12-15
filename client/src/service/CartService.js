// src/service/CartService.js
import api from "./AxiosConfig";

export const addCartItem = async (cartData) => {
    return await api.post(`/cart/add`, cartData);
};

export const getCartList = async (userId) => {
    return await api.get(`/cart/${userId}`);

};

// 수량 변경 API
export const updateCartQuantity = async (cartData) => {
    return await api.post(`/cart/update-quantity`, cartData);
};

// 선택 삭제
export const deleteSelectedCart = async (cartIds) => {
    return await api.post(`/cart/delete`, cartIds);
};

// 전체 삭제
export const deleteAllCart = async (userId) => {
    return await api.post(`/cart/delete-all/${userId}`);
};
