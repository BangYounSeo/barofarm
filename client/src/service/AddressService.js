import axios from "axios";

export const fetchUserAddresses = async (userId) => {
    return axios.get(`/api/payment/getAdd/${userId}`);
};
// 새로운 주소 저장
export const saveUserAddress = async (userId, address) => {
    return axios.post(`/api/payment/setAdd/${userId}`, address);
};

// 주소 기본 설정 변경
export const setDefaultAddress = async (userId, addressId) => {
  return await fetch(`/api/payment/${userId}/default/${addressId}`, {
    method: "PUT",
  });
};

// 주소 삭제
export const deleteAddressById = async (userId, addressId) => {
  return await fetch(`/api/payment/${userId}/${addressId}`, {
    method: "DELETE",
  });
};