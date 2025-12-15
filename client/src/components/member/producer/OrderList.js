// src/components/producer/ProducerOrderList.jsx
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
  Paper,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dayjs from "dayjs";
import { useOutletContext } from "react-router-dom";
import { getPG, getUserOrders, updateOrderStatus } from "../../../service/MemberService";
import { cancelPayment } from "../../../service/PaymentService";

// PurchaseDetailStatus 기준 라벨/색
const STATUS_LABEL = {
  READYPAY: "결제 대기",
  PAID: "결제 완료",
  CANCEL: "주문 취소",
  READYSHIP: "배송준비",
  SHIPPING: "배송중",
  COMPLETE: "배송완료",
  PARTIAL_CANCELLATION_REFUND: "부분취소환불",
  CANCELLATION_REFUND: "취소환불",
  PARTIAL_CANCELLATION: "부분취소",
  PARTIAL_REFUND: "부분환불",
  REFUNDING: "환불요청",
  REFUNDED: "환불완료",
  PARTIAL_CANCELLATION: "부분취소",
  PARTIAL_REFUND:"부분환불",
};

const STATUS_COLOR = {
  READYPAY: "#FFDD57",
  PAID: "#FFB03A",
  CANCEL: "#B0BEC5",
  SHIPPING: "#4FC3F7",
  COMPLETE: "#81C784",
  REFUNDING: "#FFD54F",
  REFUNDED: "#9575CD",
  PARTIAL_CANCELLATION: "#FFB03A",
  PARTIAL_REFUND: "#9575CD",
  PARTIAL_CANCELLATION_REFUND: "warning",
  CANCELLATION_REFUND:"warning"
};

const OrderList = () => {
  const { COLORS } = useOutletContext() || {};
  const [orders, setOrders] = useState([]); // 주문 그룹 배열
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // 운송장번호 Dialog
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [trackingTarget, setTrackingTarget] = useState(null);
  const [trackingNo, setTrackingNo] = useState("");
  const [trackingError, setTrackingError] = useState("");

  // 환불 Dialog
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundingTarget, setRefundingTarget] = useState(null);
  const [refundProcessing, setRefundProcessing] = useState(false);

  const [completeDate, setCompleteDate] = useState(null);

  const getDetailStatus = (detail) => {
    const raw = detail?.status || detail?.orderGroup?.status || "READYPAY";
    return raw.toUpperCase();
  };

  const loadOrders = async () => {
    try {
      const res = await getUserOrders({ page: page - 1, size });
      setOrders(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const handleFilterClick = (status) => setFilterStatus(status);

  // 상태 + 운송장 업데이트
  const handleStatusChangeLocal = async (numPurD, newStatus, trackingNoValue) => {
    try {
      await updateOrderStatus({ numPurD, status: newStatus, trackingNo: trackingNoValue });

      setOrders((prev) =>
        prev.map((group) => ({
          ...group,
          details: group.details.map((d) =>
            d.numPurD === numPurD
              ? {
                  ...d,
                  status: newStatus,
                  trackingNo: trackingNoValue ?? d.trackingNo,
                }
              : d
          ),
        }))
      );
    } catch (e) {
      console.error(e);
      alert("배송 상태 변경 중 오류가 발생했습니다.");
    }
  };

  // 운송장번호 Dialog
  const handleOpenTrackingDialog = (detail) => {
    setTrackingTarget(detail);
    setTrackingNo(detail.trackingNo || "");
    setTrackingError("");
    setTrackingDialogOpen(true);
  };
  const handleCloseTrackingDialog = () => {
    setTrackingDialogOpen(false);
    setTrackingTarget(null);
    setTrackingNo("");
    setTrackingError("");
  };
  const handleConfirmTracking = async () => {
    if (!trackingNo.trim()) {
      setTrackingError("운송장번호를 입력해주세요.");
      return;
    }
    if (!trackingTarget) return;

    await handleStatusChangeLocal(
      trackingTarget.numPurD,
      "SHIPPING",
      trackingNo.trim()
    );
    setCompleteDate(Date.now());
    handleCloseTrackingDialog();
  };

  // 환불 Dialog
  const handleOpenRefundDialog = (detail) => {
    setRefundingTarget(detail);
    setRefundDialogOpen(true);
  };
  const handleCloseRefundDialog = () => {
    if (refundProcessing) return;
    setRefundDialogOpen(false);
    setRefundingTarget(null);
  };
  const handleRefundDecision = async (type) => {
    if (!refundingTarget) return;
    const newStatus = type === "APPROVE" ? "REFUNDED" : "SHIPPING";

    try {
      console.log("refundingTarget",refundingTarget)
      const pg = await getPG({ numPurD: refundingTarget.numPurD });
      console.log("pg",pg)
      cancelPayment({numPurD:refundingTarget.numPurD,quantity:refundingTarget.quantity,price:refundingTarget.unitPrice,numOptD:refundingTarget.option.numOptD,numPurG:pg,type:"REFUNDED"}); 

      setRefundProcessing(true);
      await handleStatusChangeLocal(
        refundingTarget.numPurD,
        newStatus,
        refundingTarget.trackingNo
      );
      handleCloseRefundDialog();
    } catch (e) {
      console.error(e);
      alert("환불 처리 중 오류가 발생했습니다.");
    } finally {
      setRefundProcessing(false);
    }
  };

  // 그룹 필터/검색
  const filteredOrders = orders.filter((group) => {
    const lower = keyword.toLowerCase();

    const matchKeyword = keyword
      ? (group.orderGroup?.buyer || "").toLowerCase().includes(lower) ||
        group.details.some((d) =>
          [
            d.board?.subject || "",
            d.option?.optionName || "",
            d.option?.name || "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(lower)
        )
      : true;

    if (filterStatus === "ALL") return matchKeyword;

    const hasStatus = group.details.some(
      (d) => getDetailStatus(d) === filterStatus
    );

    return hasStatus && matchKeyword;
  });

  // 주문 그룹 요약 정보
  const calcGroupSummary = (group) => {
    const totalAmount = group.details.reduce(
      (sum, d) => sum + (d.linePrice || 0),
      0
    );

    const priority = ["REFUNDING", "SHIPPING", "READYSHIP", "PAID"];
    let groupStatus = group.orderGroup?.status
      ? group.orderGroup.status.toUpperCase()
      : null;

    if (!groupStatus) {
      const allStatuses = group.details.map((d) => getDetailStatus(d));
      groupStatus =
        priority.find((p) => allStatuses.includes(p)) || allStatuses[0] || "READYPAY";
    }

    return { totalAmount, groupStatus };
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f7", p: 2, borderRadius: 2 }}>
      {/* 상단 타이틀 */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            주문 / 배송 관리
          </Typography>
          <Typography variant="body2" sx={{ color: "#777", mt: 0.5 }}>
            주문 현황을 확인하고 배송 상태를 변경할 수 있어요.
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* 필터/검색 영역 */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        {/* 상태 필터 Chip */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label="전체"
            clickable
            color={filterStatus === "ALL" ? "primary" : "default"}
            variant={filterStatus === "ALL" ? "filled" : "outlined"}
            onClick={() => handleFilterClick("ALL")}
          />
          <Chip
            label="결제완료"
            clickable
            color={filterStatus === "PAID" ? "primary" : "default"}
            variant={filterStatus === "PAID" ? "filled" : "outlined"}
            onClick={() => handleFilterClick("PAID")}
          />
          <Chip
            label="배송준비"
            clickable
            color={filterStatus === "READYSHIP" ? "primary" : "default"}
            variant={filterStatus === "READYSHIP" ? "filled" : "outlined"}
            onClick={() => handleFilterClick("READYSHIP")}
          />
          <Chip
            label="배송중"
            clickable
            color={filterStatus === "SHIPPING" ? "primary" : "default"}
            variant={filterStatus === "SHIPPING" ? "filled" : "outlined"}
            onClick={() => handleFilterClick("SHIPPING")}
          />
          <Chip
            label="배송완료"
            clickable
            color={filterStatus === "COMPLETE" ? "primary" : "default"}
            variant={filterStatus === "COMPLETE" ? "filled" : "outlined"}
            onClick={() => handleFilterClick("COMPLETE")}
          />
          <Chip
            label="취소"
            clickable
            color={filterStatus === "CANCEL" ? "primary" : "default"}
            variant={filterStatus === "CANCEL" ? "filled" : "outlined"}
            onClick={() => handleFilterClick("CANCEL")}
          />
        </Stack>

        {/* 검색 + 상태 변경 Select */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <TextField
            size="small"
            placeholder="주문자 / 상품명 / 옵션명 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ width: { xs: "100%", sm: 260 } }}
          />

        </Stack>
      </Stack>

      {/* 주문 그룹 리스트 */}
      {filteredOrders.length === 0 ? (
        <Paper
          sx={{
            mt: 1,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            p: 4,
            textAlign: "center",
            bgcolor: "#fff",
          }}
        >
          <Typography variant="body2" sx={{ color: "#888" }}>
            조건에 맞는 주문이 없습니다.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {filteredOrders.map((group, idx) => {
            const order = group.orderGroup || {};
            const { totalAmount, groupStatus } = calcGroupSummary(group);

            return (
              <Paper
                key={idx}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                  border: "1px solid #eee",
                  "&:hover": {
                    boxShadow: "0 4px 18px rgba(0,0,0,0.09)",
                  },
                }}
              >
                <Accordion
                  disableGutters
                  square
                  elevation={0}
                  sx={{
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor: "#fafafa",
                      px: 2,
                      "& .MuiAccordionSummary-content": {
                        alignItems: "center",
                      },
                    }}
                  >
                    {/* 주문 요약 영역 */}
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{ width: "100%" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                      <Box sx={{ flex: 1.7 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          주문일시{" "}
                          {order.orderDate
                            ? dayjs(order.orderDate).format("YYYY-MM-DD HH:mm")
                            : "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#777" }}>
                          주문자: {order.buyer || "-"}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#555",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          배송지: [{order.receiverPostalCode || "-"}]{" "}
                          {order.receiverAddr1 || "-"} {order.receiverAddr2 || ""}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ flexShrink: 0 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, minWidth: 140, textAlign: "right" }}
                        >
                          총 결제금액:{" "}
                          {totalAmount.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                          원
                        </Typography>
                        <Chip
                          size="small"
                          label={STATUS_LABEL[groupStatus] || groupStatus}
                          variant="outlined"
                          sx={{
                            fontSize: "12px",
                            bgcolor: STATUS_COLOR[groupStatus] || "#e0e0e0",
                            color: "#fff",
                            borderColor: "transparent",
                          }}  
                        />
                      </Stack>
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 0, bgcolor: "#fff" }}>
                    {/* 헤더 행 (구매내역 탭 스타일) */}
                    <Box
                      sx={{
                        px: 2,
                        pt: 1,
                        pb: 0.8,
                        borderTop: `1px solid ${COLORS?.border || "#e0e0e0"}`,
                        borderBottom: `1px solid ${COLORS?.border || "#e0e0e0"}`,
                        bgcolor: "#fafafa",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: COLORS?.textSub || "#777",
                      }}
                    >
                      <Stack direction="row" alignItems="center">
                        <Box sx={{ flex: 5.2, textAlign: "center" }}>상품정보</Box>
                        <Box sx={{ flex: 2, textAlign: "left" }}>선택 옵션</Box>
                        <Box sx={{ flex: 1, textAlign: "center" }}>수량</Box>
                        <Box sx={{ flex: 1.4, textAlign: "center" }}>금액</Box>
                        <Box sx={{ flex: 1.4, textAlign: "center" }}>상태</Box>
                        <Box sx={{ flex: 1.8, textAlign: "center" }}>배송처리</Box>
                      </Stack>
                    </Box>

                    {/* 상세 아이템 리스트 */}
                    {group.details.map((d, idx) => {
                      const statusKey = getDetailStatus(d);

                      return (
                        <Box
                          key={d.numPurD}
                          sx={{
                            px: 2,
                            py: 1,
                            borderBottom: `1px solid ${COLORS?.borderSoft || COLORS?.border || "#eee"}`,
                            fontSize: "13px",
                          }}
                        >
                          <Stack direction="row" alignItems="center">
                            {/* 썸네일 */}
                            <Box sx={{ flex: 1.2, textAlign: "center" }}>
                              <Box
                                component="img"
                                src={d.board?.thumbnail || "/no-image.png"}
                                alt="thumbnail"
                                sx={{
                                  width: 70,
                                  height: 70,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  border: "1px solid #eee",
                                }}
                              />
                            </Box>

                            {/* 상품정보 (제목) */}
                            <Box sx={{ flex: 4 }}>
                              <Typography
                                sx={{
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: COLORS?.textMain || "#333",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  wordBreak: "break-word",
                                  mr: 2,
                                }}
                              >
                                {d.board?.subject || "-"}
                              </Typography>
                            </Box>

                            {/* 옵션명 */}
                            <Box sx={{ flex: 2 }}>
                              <Typography
                                sx={{
                                  fontSize: "13px",
                                  color: COLORS?.textMain || "#333",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  wordBreak: "break-word",
                                  mr: 2,
                                }}
                              >
                                {d.option?.name || d.option?.optionName || "-"}
                              </Typography>
                            </Box>

                            {/* 수량 */}
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontSize: "13px", textAlign: "center" }}>
                                {d.quantity}개
                              </Typography>
                            </Box>

                            {/* 금액 */}
                            <Box sx={{ flex: 1.4 }}>
                              <Typography
                                sx={{
                                  fontSize: "13px",
                                  textAlign: "center",
                                  fontWeight: 600,
                                }}
                              >
                                {(d.linePrice || 0).toLocaleString()}원
                              </Typography>
                            </Box>

                            {/* 상태 Chip */}
                            <Box sx={{ flex: 1.4, textAlign: "center" }}>
                              <Chip
                                label={STATUS_LABEL[statusKey] || statusKey}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: "12px",
                                  bgcolor: STATUS_COLOR[statusKey] || "#e0e0e0",
                                  color: "#fff",
                                  borderColor: "transparent",
                                }}
                              />
                            </Box>

                            {/* 배송처리 버튼들 (기존 로직 그대로) */}
                            <Box sx={{ flex: 1.8, textAlign: "center" }}>
                              {statusKey === "PAID" && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() =>
                                    handleStatusChangeLocal(d.numPurD, "READYSHIP")
                                  }
                                >
                                  배송준비로
                                </Button>
                              )}

                              {statusKey === "READYSHIP" && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<LocalShippingIcon />}
                                  sx={{
                                    borderRadius: 999,
                                    bgcolor: COLORS?.primary || "#FF9F56",
                                    "&:hover": {
                                      bgcolor: COLORS?.primaryDark || "#f28735",
                                    },
                                  }}
                                  onClick={() => handleOpenTrackingDialog(d)}
                                >
                                  배송 시작
                                </Button>
                              )}

                              {statusKey === "SHIPPING" && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#777", fontWeight: 500 }}
                                >
                                  자동완료 예정일:{" "}
                                  {d.shippingStartedAt
                                    ? dayjs(d.shippingStartedAt).add(3, "day").format("YYYY-MM-DD")
                                    : "-"}
                                </Typography>
                              )}

                              {statusKey === "REFUNDING" && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  onClick={() => handleOpenRefundDialog(d)}
                                >
                                  환불요청 확인
                                </Button>
                              )}

                              {(statusKey === "COMPLETE" ||
                                statusKey === "CANCEL" ||
                                statusKey === "READYPAY" ||
                                statusKey === "REFUNDED") && (
                                <Typography variant="caption" sx={{ color: "#999" }}>
                                  -
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                  </AccordionDetails>

                </Accordion>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* 페이지네이션 */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          shape="rounded"
          color="primary"
        />
      </Box>

      {/* 운송장번호 Dialog */}
      <Dialog
        open={trackingDialogOpen}
        onClose={handleCloseTrackingDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>배송 시작 처리</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1, fontSize: 14 }}>
            선택한 주문의 배송을 시작하려면 운송장번호를 입력해주세요.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="운송장번호"
            fullWidth
            variant="outlined"
            size="small"
            value={trackingNo}
            onChange={(e) => {
              setTrackingNo(e.target.value);
              setTrackingError("");
            }}
            error={!!trackingError}
            helperText={trackingError || "택배사 기준 운송장번호를 입력하세요."}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTrackingDialog}>취소</Button>
          <Button variant="contained" onClick={handleConfirmTracking}>
            배송 시작
          </Button>
        </DialogActions>
      </Dialog>

      {/* 환불요청 상세 Dialog */}
      <Dialog
        open={refundDialogOpen}
        onClose={handleCloseRefundDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>환불 요청 상세</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>주문상세번호:</strong> {refundingTarget?.numPurD}
            </Typography>
            <Typography variant="body2">
              <strong>주문자:</strong>{" "}
              {refundingTarget?.orderGroup?.buyer || "-"}
            </Typography>
            <Typography variant="body2">
              <strong>상품:</strong>{" "}
              {refundingTarget?.board?.subject || "-"} /{" "}
              {refundingTarget?.option?.optionName || "-"} /{" "}
              {refundingTarget?.option?.name || "-"}
            </Typography>
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                borderRadius: 1,
                bgcolor: "#f9f9f9",
                border: "1px solid #eee",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                환불 사유
              </Typography>
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", color: "#444" }}
              >
                {refundingTarget?.refundReason ||
                  "작성된 환불 사유가 없습니다."}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRefundDialog} disabled={refundProcessing}>
            닫기
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => handleRefundDecision("REJECT")}
            disabled={refundProcessing}
          >
            환불 거절
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleRefundDecision("APPROVE")}
            disabled={refundProcessing}
          >
            환불 승인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderList;
