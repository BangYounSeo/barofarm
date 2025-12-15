import api from "./AxiosConfig"

// ======================
// ⭐ 전체 상품 + 페이징 조회 API
// ======================
export const getLists = async (options = {}) => {

    // 기본값 설정 + 구조 분해
    const {
        page = 1,
        size = 9,
        productType,
        productItem,
        keyword,
    } = options

    const params = { page, size }
    if (productType) params.productType = productType
    if (productItem) params.productItem = productItem
    if (keyword) params.keyword = keyword

    const res = await api.get("/salesboard", { params })
    const data = res.data

    return {
        // Page 객체일 경우 content 사용
        content: data.content ?? data,
        totalPages: data.totalPages ?? 1,
        totalElements:
            data.totalElements ?? (Array.isArray(data) ? data.length : 0),
        number: data.number ?? page - 1
    }
}

//검색 목록 + 페이징 구조 동일 처리
export const searchSales = async (keyword, options = {}) => {
    return getLists({ ...options, keyword })
}


//소분류 가져오기
export const getProductItems = async (categoryCode) => {
    const res = await api.get(`/productItems?categoryCode=${categoryCode}`)
    return res.data
}

//소분류 검색하기
export const searchProductItem = async (search) => {
    const res = await api.get(`/productItems/searchItem?search=${search}`)
    return res.data
}

//상품 등록
export const createProduct = async (data) => {
    const res = await api.post("/salesboard", data)
    return res.data
}

//수정일 경우, 상품 상세 데이터 불러오기
export const getProductDetail = async (id) => {
    const res = await api.get(`/salesboard/${id}`)
    return res.data
}

//상품 수정 - 상품 실제 저장(수정 요청 보내기)
export const updateProduct = async (id, data) => {
    const res = await api.put(`/salesboard/${id}`, data)
    return res.data
}

//상품 삭제
export const deletePost = async (numBrd, userId) => {
    const res = await api.delete(`/salesboard/${numBrd}?userId=${userId}`)
    return res.data
}

//판매 상태 변경
export const updateStatus = async (id, status) => {
    const res = await api.put(`/salesboard/${id}/status?status=${status}`)
    return res.data
}

// 베스트 상품 관련 (구매횟수 많은 순)
export const getBestProducts = async () => {
    const res = await api.get("/salesboard/best");
    return res.data;
};

// 신상품 관련 (최신순)
export const getNewProducts = async () => {
    const res = await api.get("/salesboard/new");
    return res.data;
};

// 인기상품 조회수 기반
export const getPopularProducts = async () => {
    const res = await api.get("/salesboard/popular");
    return res.data;
};

