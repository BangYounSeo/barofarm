// src/components/producer/ProducerDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import dayjs from "dayjs";
import { getProducerData } from "../../../service/MemberService";

const StatCard = ({ label, value, sub }) => (
  <Paper
    sx={{
      p: 2,
      borderRadius: 2,
      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    }}
  >
    <Typography variant="body2" sx={{ color: "#888", mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
    {sub && (
      <Typography variant="caption" sx={{ color: "#999" }}>
        {sub}
      </Typography>
    )}
  </Paper>
);

// 상태 한글 매핑
const STATUS_LABELS = {
  PAID: "결제 완료",
  READYSHIP:"배송준비",
  SHIPPING: "배송중",
  COMPLETE: "배송완료",
  REFUNDING: "환불중",
  REFUNDED: "환불완료",
  PARTIAL_REFUND: "부분 환불",
  CANCELLATION_REFUND:"취소*환불"
};

// 상태별 Chip 색상
const STATUS_COLORS = {
  PAID: "primary",
  SHIPPING: "info",
  COMPLETE: "success",
  REFUNDING: "warning",
  REFUNDED: "default",
  PARTIAL_REFUND: "warning",
  CANCELLATION_REFUND:"warning"
};

const formatDateTime = (iso) => {
  if (!iso) return "-";
  return dayjs(iso).format("MM/DD HH:mm");
};

const formatMoney = (v) => {
  if (v == null) return "-";
  return v.toLocaleString();
};

const ProducerDashboard = () => {
  const [sales, setSales] = useState({ today: 0, yesterday: 0 });
  const [amount, setAmount] = useState({ today: 0, yesterday: 0 });
  const [readyship, setReadyShip] = useState(0);
  const [settlement, setSettlement] = useState(0);
  const [recentOrder, setRecentOrder] = useState([]);

  const loadData = async () => {
    const res = await getProducerData();

    // 어제 주문수 키 오타 수정: res.yeterDayOrder → res.yesterdayOrder
    setSales({
      today: res.todayOrder || 0,
      yesterday: res.yesterdayOrder || 0,
    });
    setAmount({
      today: res.todaySales || 0,
      yesterday: res.yesterdaySales || 0,
    });
    setReadyShip(res.readyShipCount || 0);
    setSettlement(res.settlementAmount || 0);
    setRecentOrder(res.recentOrders || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 최근 주문 목록을 detail 기준으로 평탄화
  const flatRows = recentOrder.flatMap((order) =>
    (order.details || []).map((detail) => ({
      numPurD: detail.numPurD,
      orderDate: detail.orderGroup?.orderDate || order.orderGroup?.orderDate,
      buyer: detail.orderGroup?.buyer || order.orderGroup?.buyer,
      receiverName:
        detail.orderGroup?.receiverName || order.orderGroup?.receiverName,
      productName: detail.board?.subject,
      optionName: detail.option
        ? `${detail.option.optionName} / ${detail.option.name}`
        : "-",
      quantity: detail.quantity,
      linePrice: detail.linePrice,
      status: detail.status,
    }))
  );

  const orderDiff = sales.today - sales.yesterday;
  const salesRate =
    amount.yesterday > 0
      ? `${(((amount.today - amount.yesterday) / amount.yesterday) * 100).toFixed(
          1
        )}%`
      : "-";

  const groupStatusKey = (order) => {
    order.orderGroup.status?.include(["PAID",])
  } 

  return (
    <Box>
      {/* 상단 타이틀 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          오늘의 현황
        </Typography>
        <Typography variant="body2" sx={{ color: "#777", mt: 0.5 }}>
          오늘 들어온 주문과 매출, 배송 상태를 한 눈에 확인해요.
        </Typography>
      </Box>

      {/* 통계 카드 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="오늘 주문수"
            value={`${sales.today}건`}
            sub={`어제보다 ${orderDiff >= 0 ? "+" : ""}${orderDiff}건`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="오늘 매출"
            value={`₩ ${formatMoney(amount.today)}`}
            sub={`어제 대비 ${salesRate}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="배송 준비중" value={`${readyship}건`} sub="출고 대기" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="정산 예정금"
            value={`₩ ${formatMoney(settlement)}`}
            sub="다음 주(월) 예정"
          />
        </Grid>
      </Grid>

      {/* 아래 영역: 최근 주문 리스트, 공지 등 */}
      <Grid container spacing={2}>
        {/* 최근 주문 테이블 */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              최근 주문
            </Typography>

            {recentOrder.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#999" }}>
                최근 주문 내역이 없습니다.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>상품명</TableCell>
                    <TableCell>옵션</TableCell>
                    <TableCell align="right">수량</TableCell>
                    <TableCell align="right">금액</TableCell>
                    <TableCell>상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrder.slice(0, 5).map((order, idx) => (
                    <React.Fragment key={idx}>
                      {/* 👉 그룹 헤더 (주문 단위) */}
                      <TableRow sx={{ bgcolor: "#fafafa" }}>
                        <TableCell colSpan={5}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                주문일시: {formatDateTime(order.orderGroup.orderDate)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#777" }}>
                                구매자: {order.orderGroup.buyer} / 수령인:{" "}
                                {order.orderGroup.receiverName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#aaa", ml: 1 }}>
                                ({order.orderGroup.receiverPostalCode}{" "}
                                {order.orderGroup.receiverAddr1})
                              </Typography>
                            </Box>
                            <Chip
                              label={
                                STATUS_LABELS[order.orderGroup.status] ||
                                order.orderGroup.status
                              }
                              size="small"
                              color={
                                STATUS_COLORS[order.orderGroup.status] || "default"
                              }
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* 👉 이 주문에 속한 상품 상세들 */}
                      {order.details.map((detail) => (
                        <TableRow key={detail.numPurD} hover>
                          <TableCell sx={{ maxWidth: 220 }}>
                            <Typography
                              variant="body2"
                              noWrap
                              title={detail.board?.subject}
                            >
                              {detail.board?.subject}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 160 }}>
                            <Typography
                              variant="body2"
                              noWrap
                              title={
                                detail.option
                                  ? `${detail.option.optionName} / ${detail.option.name}`
                                  : "-"
                              }
                            >
                              {detail.option
                                ? `${detail.option.optionName} / ${detail.option.name}`
                                : "-"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{detail.quantity}</TableCell>
                          <TableCell align="right">
                            ₩ {formatMoney(detail.linePrice)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={STATUS_LABELS[detail.status] || detail.status}
                              size="small"
                              color={STATUS_COLORS[detail.status] || "default"}
                              sx={{ fontSize: 12 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>


        {/* 공지 / 안내 */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              공지 / 안내
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">• 배송 지연 안내 등록하기</Typography>
              <Typography variant="body2">• 새로 등록된 리뷰 확인하기</Typography>
              <Typography variant="body2">
                • 정산 계좌 정보를 최신으로 유지하세요
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProducerDashboard;
