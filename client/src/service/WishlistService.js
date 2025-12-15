import api from "./AxiosConfig";

// 🔍 찜한 상품 목록 조회
export const getMyWishlist = () => {
    return api.get("/wishlist");
};

// 🔥 찜 토글 (재사용)
export const toggleWishlist = (numBrd) => {
    return api.post(`/wishlist/${numBrd}`);
};