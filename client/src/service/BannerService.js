import api from "./AxiosConfig";

//메인 배너 가져오기
export const getMainBanners = async () => {
    const res = await api.get("/banner/main")
    return res.data
}

//중간 배너 가져오기
export const getMidBanners = async () => {
    const res = await api.get("/banner/mid")
    return res.data
}

//전체 배너 가져오기 (관리자)
export const getAllBanners = async () => {
    const res = await api.get("/banner/all")
    return res.data
}

//백엔드: POST /api/banner
export const createBanner = async (data) => {
    const res = await api.post("/banner", data)
    return res.data
}

//배너 수정
export const updateBanner = async (id, data) => {
    const res = await api.put(`/banner/${id}`, data)
    return res.data
}

//배너 삭제
export const deleteBanner = async (id) => {
    const res = await api.delete(`/banner/${id}`)
    return res.data
}
