// src/components/member/order/BuyerOrderDetail.js

import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  Button,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Dialog,
} from "@mui/material";
import dayjs from "dayjs";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { getMyOrderDetail,updateMyOrderStatus } from "../../../service/MemberService";
import { MemberContext } from "../login/MemberContext";
import { addCartItem } from "../../../service/CartService";
import { cancelPayment, canclePayment } from "../../../service/PaymentService";

const STATUS_LABEL = {
  READYPAY: "결제 대기",
  PAID: "결제 완료",
  CANCEL: "주문 취소",
  PARTIAL_CANCELLATION_REFUND: "부분취소환불",
  CANCELLATION_REFUND: "취소환불",
  PARTIAL_CANCELLATION: "부분 취소",
  PARTIAL_REFUND: "부분 환불",
  READYSHIP:"배송준비",
  SHIPPING: "배송중",
  COMPLETE: "배송완료",
  REFUNDING: "환불중",
  REFUNDED: "환불완료",
  PARTIAL_CANCELLATION: "부분취소",
  PARTIAL_REFUND:"부분환불",
};

const STATUS_COLOR = {
  READYPAY: "#FFDD57",
  PAID: "#FFB03A",
  CANCEL: "#B0BEC5",
   PARTIAL_CANCELLATION_REFUND: "#FFDD57",
  CANCELLATION_REFUND: "#FFD54F",
  PARTIAL_CANCELLATION: "#FFDD57",
  PaRTIAL_REFUND: "#FFD54F",
  SHIPPING: "#4FC3F7",
  COMPLETE: "#81C784",
  REFUNDING: "#FFD54F",
  REFUNDED: "#9575CD",
  PARTIAL_CANCELLATION: "#FFB03A",
  PARTIAL_REFUND: "#9575CD",
};

const BuyerOrderDetail = () => {
  const { COLORS, SHADOWS } = useOutletContext();
  const { numPurG } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null);    // 어떤 item을 환불할지
  const [refundReason, setRefundReason] = useState("");
  const [refundReasonError, setRefundReasonError] = useState("");

  const {userId} = useContext(MemberContext);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await getMyOrderDetail(numPurG);
      setOrder(data);
    } catch (err) {
      console.error(err);
      // 에러 처리 (알림, 404 페이지 이동 등)
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    loadDetail();
  }, [numPurG]);

  if (loading) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ py: 6, textAlign: "center", color: COLORS.textSub }}>
        주문 정보를 불러올 수 없습니다.
      </Box>
    );
  }

  const statusKey = order.status?.toUpperCase?.() || "READYPAY";
  const itemsTotal = order.items?.reduce(
    (sum, item) => sum + item.linePrice,
    0
  );

    // 🎯 개별 상품 취소 가능 여부
  const canCancelItem = (itemStatusKey) => {
    return ["READYPAY", "PAID", "READYSHIP"].includes(itemStatusKey);
  };

  // 🎯 개별 상품 환불 요청 가능 여부
  const canRefundItem = (itemStatusKey, item) => {
    // 배송중은 항상 환불 요청 가능
    if (itemStatusKey === "SHIPPING") return true;

    // COMPLETE 는 3일 이내만 가능
    if (itemStatusKey === "COMPLETE") {
      // ✅ 기준 날짜: item.completedAt 을 쓰는 게 제일 좋음
      // 백엔드 DTO에서 내려주지 않으면 order.orderDate 로 임시로 계산해도 됨
      const base = item.completedAt || order.orderDate;
      if (!base) return false;

      const deadline = dayjs(base).add(3, "day").endOf("day");
      return dayjs().isBefore(deadline);
    }

    return false;
  };

  // 🧾 구매 취소 요청
  const handleCancelItem = async (item) => {
    if (!window.confirm("해당 상품 주문을 취소하시겠습니까?")) return;

    try {
      cancelPayment({numPurD:item.numPurD,quantity:item.quantity,price:item.price,numOptD:item.option.numOptD,numPurG:numPurG,type:"CANCEL"}); 

      await updateMyOrderStatus({numPurD:item.numPurD,status:"CANCEL"}); // 백엔드에 맞게 수정

      // 로컬 상태 갱신
      setOrder((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.numPurD === item.numPurD ? { ...it, status: "CANCEL" } : it
        ),
      }));
    } catch (e) {
      console.error(e);
      alert("구매 취소 중 오류가 발생했습니다.");
    }
  };

  // 🛒 장바구니 담기
  const handleAddToCart = async (item) => {
    try {
      await addCartItem({
        userId:userId,
        numBrd: item.numBrd,       // 판매글 번호
        numOptD: item.option.numOptD,   // 옵션 ID (DTO에 있는 필드 기준으로 맞춰줘)
        quantity: 1,               // 기본 1개, 원래 수량 쓰고 싶으면 item.quantity
        optionName: item.option.name
      });

      if (window.confirm("장바구니에 담았습니다. 장바구니로 이동할까요?")) {
        navigate("/cart");
      }
    } catch (e) {
      console.error(e);
      alert("장바구니 담기 중 오류가 발생했습니다.");
    }
  };

  // 🔁 재구매 (바로 장바구니 넣고 이동 or 상세페이지로 이동 등)
  const handleReorder = async (item) => {
    // 1안: 기존과 동일하게 장바구니에 담고 장바구니 페이지로 이동
    try {

      const purchaseItemList = [{
        ...item.option,
        quantity:item.quantity,
        numBrd:item.numBrd,
        productImage:item.thumbnail,
        productName:item.subject,
        price:item.price,
        optionName:item.option.name
      }]
      navigate("/paymentDetail", {
        state: { 
            userId,
            items : purchaseItemList,
            totalPrice:item.price
          }
      });
    } catch (e) {
      console.error(e);
      alert("재구매 처리 중 오류가 발생했습니다.");
    }
  };

  const handleOpenRefundDialog = (item) => {
    setRefundTarget(item);
    setRefundReason("");
    setRefundReasonError("");
    setRefundDialogOpen(true);
  };

  const handleCloseRefundDialog = () => {
    setRefundDialogOpen(false);
    setRefundTarget(null);
    setRefundReason("");
    setRefundReasonError("");
  };

    const handleSubmitRefund = async () => {
    if (!refundReason.trim()) {
      setRefundReasonError("환불 요청 사유를 입력해주세요.");
      return;
    }
    if (!refundTarget) return;

    if (!window.confirm("해당 상품에 대해 환불을 요청하시겠습니까?")) return;

    try {

      
      // 백엔드에 맞게 파라미터 형태 맞춰주세요!
      await updateMyOrderStatus({
        numPurD: refundTarget.numPurD,
        refundReason: refundReason.trim(),
        status:"REFUNDING"
      });

      // 로컬 상태 갱신 (상태 REFUNDING으로 변경)
      setOrder((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.numPurD === refundTarget.numPurD
            ? { ...it, status: "REFUNDING" }
            : it
        ),
      }));

      handleCloseRefundDialog();
    } catch (e) {
      console.error(e);
      alert("환불 요청 중 오류가 발생했습니다.");
    }
  };


  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 2 }}>
      {/* 상단 헤더 영역 */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
            주문 상세
          </Typography>
          <Typography sx={{ fontSize: 13, color: COLORS.textSub, mt: 0.5 }}>
            주문번호 {order.numPurG} ·{" "}
            {dayjs(order.orderDate).format("YYYY-MM-DD HH:mm")}
          </Typography>
        </Box>

        <Chip
          label={STATUS_LABEL[statusKey]}
          sx={{
            bgcolor: STATUS_COLOR[statusKey],
            fontSize: 13,
            fontWeight: 500,
          }}
        />
      </Stack>

      {/* 전체 박스 */}
      <Stack spacing={2}>
        {/* 배송지 정보 */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            boxShadow: SHADOWS.soft,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 1 }}>
            배송지 정보
          </Typography>
          <Divider sx={{ mb: 1.5 }} />

          <Stack spacing={0.7}>
            <Typography sx={{ fontSize: 14 }}>
              <b>수령인</b> {order.receiverName}
            </Typography>
            <Typography sx={{ fontSize: 14 }}>
              <b>연락처</b> {order.receiverPhone}
            </Typography>
            <Typography sx={{ fontSize: 14 }}>
              <b>주소</b>{" "}
              {`(${order.postalCode}) ${order.addr1} ${order.addr2 || ""}`}
            </Typography>
            {order.shippingMemo && (
              <Typography sx={{ fontSize: 14, color: COLORS.textSub }}>
                <b>요청사항</b> {order.shippingMemo}
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* 주문 상품 목록 */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            boxShadow: SHADOWS.soft,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 1 }}>
            주문 상품
          </Typography>
          <Divider sx={{ mb: 1.5 }} />

          {order.items.map((item) => {
            const itemStatusKey = item.status?.toUpperCase?.() || order.status?.toUpperCase?.() || "READYPAY";
          return (
            <Stack
              key={item.numPurD}
              direction="row"
              spacing={1.5}
              sx={{
                py: 1.2,
                borderBottom: `1px solid ${COLORS.borderSoft || COLORS.border}`,
              }}
            >
              {/* 썸네일 */}
              <Box sx={{ width: 80, flexShrink: 0 }}>
                <Box
                  component="img"
                  src={item.thumbnail}
                  alt="thumb"
                  sx={{
                    width: 70,
                    height: 70,
                    objectFit: "cover",
                    borderRadius: 1.5,
                    border: `1px solid ${COLORS.border}`,
                  }}
                />
              </Box>

              {/* 텍스트 영역 */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{justifyContent:'space-between',display:'flex'}}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      mb: 0.3,
                      cursor: "pointer",
                      "&:hover": { color: COLORS.primaryStrong },
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      wordBreak: "break-word",
                    }}
                    onClick={() => navigate(`/detail/${item.numBrd}`)}
                  >
                    {item.subject}
                  </Typography>
                  <Chip
                    label={STATUS_LABEL[itemStatusKey]}
                    size="small"
                    sx={{
                      bgcolor: STATUS_COLOR[itemStatusKey],
                      fontSize: 12,
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: COLORS.textSub,
                    mb: 0.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    wordBreak: "break-word",
                  }}
                >
                  옵션: {item.option.name || "-"}
                </Typography>

                               <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: 13 }}>
                    수량 {item.quantity}개
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                    {item.linePrice.toLocaleString()}원
                  </Typography>
                </Stack>

                {/* 리뷰 상태 / 리뷰 버튼 */}
                {item.reviewed ? (
                  <Typography
                    sx={{ fontSize: 12, color: COLORS.primaryStrong, mt: 0.5 }}
                  >
                    이미 리뷰를 작성한 상품입니다.
                  </Typography>
                ) : (
                  itemStatusKey === "COMPLETE" && (
                    <Button
                      variant="text"
                      size="small"
                      sx={{ mt: 0.3, fontSize: 12, p: 0, minWidth: "auto" }}
                      onClick={() =>
                        navigate(`/review/write/${item.numBrd}`)
                      }
                    >
                      리뷰 작성하기
                    </Button>
                  )
                )}

                {/* ✅ 행동 버튼 영역 : 취소 / 환불 / 장바구니 / 재구매 */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 0.5, flexWrap: "wrap" }}
                >
                  {/* 구매 취소: 배송중 이전 (READYPAY / PAID / READYSHIP) */}
                  {canCancelItem(itemStatusKey) && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      sx={{ fontSize: 12 }}
                      onClick={() => handleCancelItem(item)}
                    >
                      구매취소
                    </Button>
                  )}

                  {/* 환불 요청: SHIPPING 이거나, COMPLETE 후 3일 이내 */}
                  {canRefundItem(itemStatusKey, item) && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: 12 }}
                      onClick={() => handleOpenRefundDialog(item)}
                    >
                      환불요청
                    </Button>
                  )}

                  {/* 장바구니 담기 */}
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: 12 }}
                    onClick={() => handleAddToCart(item)}
                  >
                    장바구니 담기
                  </Button>

                  {/* 재구매 */}
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ fontSize: 12 }}
                    onClick={() => handleReorder(item)}
                  >
                    재구매
                  </Button>
                </Stack>

              </Box>
            </Stack>
          )})}
        </Paper>

        {/* 결제 정보 / 금액 요약 */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            boxShadow: SHADOWS.soft,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 1 }}>
            결제 정보
          </Typography>
          <Divider sx={{ mb: 1.5 }} />

          <Stack spacing={0.7} sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 14 }}>
              <b>결제 수단</b>{" "}
              {order.paymentMethod || "-"}
            </Typography>
            <Typography sx={{ fontSize: 14 }}>
              <b>결제사</b>{" "}
              {order.paymentProvider || "-"}
            </Typography>
            {order.paidAt && (
              <Typography sx={{ fontSize: 14 }}>
                <b>결제 일시</b>{" "}
                {dayjs(order.paidAt).format("YYYY-MM-DD HH:mm")}
              </Typography>
            )}
            {order.paymentTid && (
              <Typography sx={{ fontSize: 12, color: COLORS.textSub }}>
                거래 ID: {order.paymentTid}
              </Typography>
            )}
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <Stack spacing={0.7} alignItems="flex-end">
            <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
              <Typography sx={{ fontSize: 14, color: COLORS.textSub }}>
                상품 합계
              </Typography>
              <Typography sx={{ fontSize: 14 }}>
                {itemsTotal.toLocaleString()}원
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" sx={{ width: "100%", mt: 1 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                총 결제 금액
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: COLORS.primaryStrong }}>
                {order.totalPrice.toLocaleString()}원
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* 하단 버튼 */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }} spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => navigate("/user/mypage/orders")}
          >
            목록으로
          </Button>
        </Stack>
        <Dialog
        open={refundDialogOpen}
        onClose={handleCloseRefundDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>환불 요청</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, mb: 1 }}>
            환불을 요청하는 사유를 자세히 적어주세요. 판매자가 확인 후 처리합니다.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="환불 요청 사유"
            multiline
            minRows={3}
            fullWidth
            value={refundReason}
            onChange={(e) => {
              setRefundReason(e.target.value);
              setRefundReasonError("");
            }}
            error={!!refundReasonError}
            helperText={refundReasonError || "예: 상품 불량, 파손, 오배송 등"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRefundDialog}>취소</Button>
          <Button variant="contained" onClick={handleSubmitRefund}>
            환불 요청하기
          </Button>
        </DialogActions>
      </Dialog>
      </Stack>
    </Box>
  );
};

export default BuyerOrderDetail;
