// src/service/ProducerService.js
import api from "./AxiosConfig";

// 🔹 판매자 정보 조회
export const getProducerProfile = () => {
    return api.get("/producer/profile");
};

// 🔹 판매자 정보 업데이트
export const updateProducerProfile = (data) => {
    return api.put("/producer/profile", data); 
};
