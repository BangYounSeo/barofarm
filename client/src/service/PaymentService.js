// src/service/PaymentService.js
import api from "./AxiosConfig";

// 주문 생성 (상세 즉시구매 / 장바구니 구매 공통)
export const createOrder = async (orderData) => {
    return await api.post(`/payment/order`, orderData, {
        headers: { Authorization: "" }   // ⭐ 명시적으로 헤더 제거
    });
};;

// 결제 승인 처리 (PG Confirm)
export const confirmPayment = async (confirmData) => {
    return await api.post(`/payment/confirm`, confirmData);
};

// ⭐ 결제 검증 요청 추가
export const verifyPayment = async (paymentId) => {
    return api.post(`/payment/verify`, { paymentId });
};

export const cancelPayment = async (request) => {
    return api.post(`/payment/cancel`, request);
};
