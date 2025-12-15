// src/service/AdminService.js
import api from "./AxiosConfig";

// 대시보드 요약
export const fetchDashboardSummary = () =>
  api.get("/admin/dashboard");

export const fetchMemberSummary = () =>
  api.get("/admin/dashboard2");

// 회원 목록 
export const fetchMembers = (params) =>
  api.get("/admin/members", { params });

// 한 번에 전체 수정
export const updateMemberDetail = (userId, payload) =>
  api.put(`/admin/members/${userId}`, payload);
  // baseURL = "/api" 이라서 실제로는 /api/admin/members/{userId}

// 프로듀서(셀러) 승인 관련
export const fetchPendingProducers = () =>
  api.get("/admin/producers/pending");

export const approveProducer = (proId) =>
  api.patch(`/admin/producers/${proId}/approve`);

export const rejectProducer = (proId, reason) =>
  api.patch(`/admin/producers/${proId}/reject`, null, { params: { reason } });

// Q&A
export const fetchQnaList = (params) =>
  api.get("/admin/qna", { params });

export const answerQna = (numQna, payload) =>
  api.patch(`/admin/qna/${numQna}/answer`, payload);

// 주문/결제
export const fetchOrders = (params) =>
  api.get("/admin/orders", { params });

// 🔥 주문 상세 조회 추가
export const fetchOrderDetail = (numPurG) =>
  api.get(`/admin/orders/${numPurG}`);

// 🔥 디테일(옵션) 상태 변경
export const updateDetailStatus = (numPurD, status) =>
  api.patch(`/admin/orders/details/${numPurD}/status`, null, {
    params: { status },
  });

export const fetchPayments = (params) =>
  api.get("/admin/payments", { params });

// (추가) 프로듀서 전체 목록 + 페이징
export const fetchProducers = (params) =>
  api.get("/admin/producers", { params });
// => 백엔드에서 Page<ProducerDTO> 리턴하도록 구현

// (추가) 프로듀서 상태 변경
export const updateProducerStatus = (proId, body) =>
  api.patch(`/admin/producers/${proId}/status`, body);

// 목록 조회
export const fetchReports = (params) =>
  api.get("/admin/reports", { params });

// 상태 변경 (READY / DELETE / CANCEL / LOGIN_LIMIT + 사유)
export const updateReportStatus = (reportId, payload) =>
  api.patch(`/admin/reports/${reportId}`, payload);

// 신고 내역 삭제 (휴지통)
export const deleteReport = (reportId) =>
  api.delete(`/admin/reports/${reportId}`);

// 메인 접속 시 보여줄 팝업
export const fetchActivePopups = () =>
  api.get("/popups/active");

// === 관리자용 팝업 관리 ===
export const fetchAdminPopups = (params) =>
  api.get("/admin/popups", { params });

export const createPopup = (payload) =>
  api.post("/admin/popups", payload);

export const updatePopup = (id, payload) =>
  api.put(`/admin/popups/${id}`, payload);

export const deletePopup = (id) =>
  api.delete(`/admin/popups/${id}`);