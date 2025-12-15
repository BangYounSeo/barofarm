import api from "./AxiosConfig";

export const saveReview = (formData, userId) => {
    return api.post("/review/write", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
};

// ⭐ 페이징 지원 리뷰 조회 API
export const getPagedReviews = (numBrd, page, size) =>
    api.get(`/review/${numBrd}?page=${page}&size=${size}`);

// 좋아요 상태 조회
export const getReviewGood = (numRev) =>
    api.get(`/review/${numRev}/good`);

// 좋아요 토글
export const toggleReviewGood = (numRev) =>
    api.post(`/review/${numRev}/good`);

// 🚨 리뷰 신고 API 추가
export const reportReview = (numRev, data) =>
    api.post(`/review/${numRev}/report`, data);

// 리뷰 수정
export const updateReview = (numRev, formData) =>
    api.post(`/review/update/${numRev}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });


// 리뷰 삭제
export const deleteReviewApi = (numRev) =>
    api.delete(`/review/${numRev}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

export const getReviewDetail = (numRev) =>
    api.get(`/review/detail/${numRev}`).then((res) => res.data);
