import api from "./AxiosConfig";
///api/salesboard/{numBrd}를 호출함
export const getProductDetail = async (numBrd) => {
    const response = await api.get(`/salesboard/${numBrd}`);
    return response.data;
};