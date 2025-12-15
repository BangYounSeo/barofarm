// src/components/admin/AdminOrderDetailModal.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Stack,
  Chip,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import dayjs from "dayjs";
import { updateDetailStatus } from "../../service/AdminService";

// 🔹 상태 레이블/색상 (enum 기준)
const STATUS_LABEL = {
  READYPAY: "결제 대기",
  PAID: "결제 완료",
  CANCEL: "주문 취소",
  SHIPPING: "배송중",
  COMPLETE: "배송완료",
  REFUNDING: "환불중",
  REFUNDED: "환불완료",
};

const STATUS_COLOR = {
  READYPAY: "#FFDD57",
  PAID: "#FFB03A",
  CANCEL: "#B0BEC5",
  SHIPPING: "#4FC3F7",
  COMPLETE: "#81C784",
  REFUNDING: "#FFD54F",
  REFUNDED: "#9575CD",
};

export default function AdminOrderDetailModal({ order, loading,onOrderUpdate }) {
  const [localOrder, setLocalOrder] = useState(order);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  if (loading && !localOrder) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!localOrder) return null;

  const details = localOrder.details || [];

  const handleChangeStatus = async (detail, newStatus) => {
    try {
      setSavingId(detail.numPurD);
      await updateDetailStatus(detail.numPurD, newStatus);

      setLocalOrder(function (prev) {
        if(!prev) return prev;

        const newDetails = (prev.details || []).map(function (d) {
          if(d.numPurD === detail.numPurD) {
            var cloned = Object.assign({},d);
            cloned.status = newStatus;
            return cloned;
          }
          return d;
        });
        const updated = Object.assign({},prev,{details:newDetails});

        if(typeof onOrderUpdate === "function") {
          onOrderUpdate(updated);
        }
        return updated;
      })
    } catch (e) {
      console.error(e);
      alert("상태 변경 중 오류가 발생했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  const renderStatusChip = (status) => {
    if (!status) return null;
    const label = STATUS_LABEL[status] || status;
    const color = STATUS_COLOR[status] || "#CFD8DC";
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: color,
          color: "#fff",
          fontSize: 12,
          fontWeight: 500,
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        p: 2.5,
        bgcolor: "#fafafa",
        borderTop: "1px solid #eee",
        borderBottom: "1px solid #eee",
      }}
    >
      {/* 상단: 주문 기본 정보 */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
          주문 상세 #{localOrder.numPurG}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#777" }}>
          {localOrder.orderDate
            ? dayjs(localOrder.orderDate).format("YYYY-MM-DD HH:mm")
            : "-"}
        </Typography>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* 배송지 정보 */}
      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>배송지 정보</Typography>
      <Box sx={{ mt: 1, mb: 2, fontSize: 13 }}>
        <div>수령인: {localOrder.receiverName}</div>
        <div>연락처: {localOrder.receiverPhone}</div>
        <div>
          주소: ({localOrder.receiverPostalCode}) {localOrder.receiverAddr1}{" "}
          {localOrder.receiverAddr2}
        </div>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* 상품 목록 + 디테일 상태 수정 */}
      <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
        상품 목록 / 상태 관리
      </Typography>

      {details.map(function (d) {
        return (
          <Box
            key={d.numPurD}
            sx={{
              my: 1,
              p: 1.5,
              borderRadius: 1,
              border: "1px solid #e0e0e0",
              bgcolor: "#fff",
            }}
          >
            <Stack direction="row" spacing={2}>
              {d.thumbnail && (
                <img
                  src={d.thumbnail}
                  width={70}
                  height={70}
                  alt="thumbnail"
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
              )}

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {d.subject}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#777" }}>
                  옵션: {d.optionName}
                </Typography>
                <Typography sx={{ fontSize: 13, mt: 0.5 }}>
                  수량 {d.quantity}개 ·{" "}
                  {d.finalPrice != null
                    ? d.finalPrice.toLocaleString() + "원"
                    : "-"}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  {renderStatusChip(d.status)}

                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select
                      value={d.status || "READYPAY"}
                      onChange={function (e) {
                        handleChangeStatus(d, e.target.value);
                      }}
                      sx={{ fontSize: 12, height: 30 }}
                    >
                      {Object.keys(STATUS_LABEL).map(function (key) {
                        return (
                          <MenuItem key={key} value={key}>
                            {STATUS_LABEL[key]}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>

                  {savingId === d.numPurD && (
                    <CircularProgress size={16} sx={{ ml: 1 }} />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>
        );
      })}

      <Divider sx={{ my: 1.5 }} />

      {/* 결제 정보 */}
      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>결제 정보</Typography>
      <Box sx={{ mt: 1, fontSize: 13 }}>
        <div>결제상태: {localOrder.paymentStatus}</div>
        <div>
          총 결제금액:{" "}
          {localOrder.amount != null
            ? localOrder.amount.toLocaleString() + "원"
            : "-"}
        </div>
        <div>
          승인시간:{" "}
          {localOrder.approvedAt
            ? dayjs(localOrder.approvedAt).format("YYYY-MM-DD HH:mm")
            : "-"}
        </div>
      </Box>
    </Box>
  );
}
