import api from "./AxiosConfig";

//  공지사항 목록 조회
export const getNotices = () => {
    return api.get("/notice");
};

//  공지사항 상세조회
export const getNoticeDetail = (id) => {
    return api.get(`/notice/${id}`);
};

//  공지사항 등록
export const writeNotice = (data) => {
    return api.post("/notice", data);
};

//  공지사항 글 수정
export const updateNotice = (id, data) => {
    return api.put(`/notice/${id}`, data);
};
