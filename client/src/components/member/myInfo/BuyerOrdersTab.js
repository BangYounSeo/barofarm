import {
  Box,
  Button,
  Chip,
  Pagination,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getmyOrders } from "../../../service/MemberService";

const RANGE = {
  ALL: "ALL",
  SIX_MONTHS: "6M",
  THREE_MONTHS: "3M",
  ONE_MONTH: "1M",
  ONE_WEEK: "1W",
  CUSTOM: "CUSTOM",
};

const STATUS = {
  READYPAY: "결제 대기",
  PAID: "결제 완료",
  FAILED: "결제 실패",
  CANCEL: "주문 취소",
  READYSHIP: "배송준비중",
  PARTIAL_CANCELLATION_REFUND: "부분취소환불",
  CANCELLATION_REFUND: "취소 환불",
  PARTIAL_CANCELLATION: "부분 취소",
  PARTIAL_REFUND: "부분 환불",
  SHIPPING: "배송중",
  COMPLETE: "배송완료",
  REFUNDING: "환불중",
  REFUNDED: "환불완료",
};

const ORDER_COLORS = {
  READYPAY: "#FFDD57",
  PAID: "#FFB03A",
  FAILED: "#FF6B6B",
  CANCEL: "#B0BEC5",
  PARTIAL_CANCELLATION_REFUND: "#FFDD57",
  CANCELLATION_REFUND: "#FFD54F",
  PARTIAL_CANCELLATION: "#FFB03A",
  PARTIAL_REFUND: "#9575CD",
  SHIPPING: "#4FC3F7",
  COMPLETE: "#81C784",
  REFUNDING: "#FFD54F",
  REFUNDED: "#9575CD",
};

const BuyerOrdersTab = () => {
  const { COLORS, SHADOWS } = useOutletContext();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [rangeType, setRangeType] = useState(RANGE.THREE_MONTHS);
  const [startDate, setStartDate] = useState(dayjs().subtract(3, "month"));
  const [endDate, setEndDate] = useState(dayjs());

  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [orders, setOrders] = useState([]);

  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      const res = await getmyOrders({
        page: page - 1,
        size,
        startDate:
          rangeType === RANGE.ALL || !startDate
            ? undefined
            : startDate.format("YYYY-MM-DD"),
        endDate:
          rangeType === RANGE.ALL || !endDate
            ? undefined
            : endDate.format("YYYY-MM-DD"),
      });
      setOrders(res.content);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, size, startDate, endDate]);

  const handleQuickRange = (type) => {
    const today = dayjs();
    let start = null;

    switch (type) {
      case RANGE.SIX_MONTHS:
        start = today.subtract(6, "month");
        break;
      case RANGE.THREE_MONTHS:
        start = today.subtract(3, "month");
        break;
      case RANGE.ONE_MONTH:
        start = today.subtract(1, "month");
        break;
      case RANGE.ONE_WEEK:
        start = today.subtract(1, "week");
        break;
      case RANGE.ALL:
        start = null;
        break;
      default:
        break;
    }
    setRangeType(type);
    setStartDate(start);
    setEndDate(today);
  };

  const handleStartChange = (value) => {
    setRangeType(RANGE.CUSTOM);
    setStartDate(value);
  };

  const handleEndChange = (value) => {
    setRangeType(RANGE.CUSTOM);
    setEndDate(value);
  };

  const rangeButtonSx = (type) => ({
    minWidth: "60px",
    fontSize: "12px",
    textTransform: "none",
    borderRadius: "999px",
    px: 1.2,
    py: 0.3,
    borderColor: rangeType === type ? COLORS.primaryStrong : COLORS.border,
    color: rangeType === type ? COLORS.primaryStrong : COLORS.textSub,
    "&:hover": {
      borderColor: COLORS.primaryStrong,
      background:
        rangeType === type ? COLORS.primarySoft : "transparent",
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* 상단 타이틀 + 기간 버튼 */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          sx={{ mb: 2, gap: 1.5 }}
        >
          <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
            주문 내역
          </Typography>

          <Stack
            direction="row"
            spacing={0.8}
            flexWrap="wrap"
            justifyContent={{ xs: "flex-start", md: "flex-end" }}
          >
            <Button
              variant="outlined"
              size="small"
              sx={rangeButtonSx(RANGE.ALL)}
              onClick={() => handleQuickRange(RANGE.ALL)}
            >
              전체
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={rangeButtonSx(RANGE.SIX_MONTHS)}
              onClick={() => handleQuickRange(RANGE.SIX_MONTHS)}
            >
              6개월
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={rangeButtonSx(RANGE.THREE_MONTHS)}
              onClick={() => handleQuickRange(RANGE.THREE_MONTHS)}
            >
              3개월
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={rangeButtonSx(RANGE.ONE_MONTH)}
              onClick={() => handleQuickRange(RANGE.ONE_MONTH)}
            >
              1개월
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={rangeButtonSx(RANGE.ONE_WEEK)}
              onClick={() => handleQuickRange(RANGE.ONE_WEEK)}
            >
              1주일
            </Button>
          </Stack>
        </Stack>

        {/* 날짜 선택 */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <DatePicker
            label="시작일"
            value={startDate}
            onChange={handleStartChange}
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 115, maxWidth: { xs: 135 } },
              },
            }}
          />
          <Typography sx={{ fontSize: 12 }}>~</Typography>
          <DatePicker
            label="종료일"
            value={endDate}
            onChange={handleEndChange}
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 115, maxWidth: { xs: 135 } },
              },
            }}
          />
        </Stack>

        {/* 리스트 */}
        {orders.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              color: COLORS.textSub,
              fontSize: "14px",
            }}
          >
            해당 기간의 주문 내역이 없습니다.
          </Box>
        ) : (
          <Box>
            {/* PC용 헤더 행 */}
            <Box
              sx={{
                p: 2,
                borderRadius: "14px",
                border: `1px solid ${COLORS.border}`,
                boxShadow: SHADOWS.soft,
                mb: 1.5,
                bgcolor: "#fafafa",
                display: { xs: "none", sm: "block" },
              }}
            >
              <Stack
                direction="row"
                sx={{
                  pb: 1,
                  borderBottom: `1px solid ${COLORS.border}`,
                  fontSize: "13px",
                  fontWeight: 600,
                  color: COLORS.textSub,
                }}
              >
                <Box sx={{ flex: 5.2, textAlign: "center" }}>판매글 제목</Box>
                <Box sx={{ flex: 2, textAlign: "left" }}>선택 옵션</Box>
                <Box sx={{ flex: 1, textAlign: "center" }}>수량</Box>
                <Box sx={{ flex: 1.4, textAlign: "center" }}>금액</Box>
                <Box sx={{ flex: 1.4, textAlign: "center" }}>상태</Box>
              </Stack>
            </Box>

            {/* 주문 카드들 */}
            {orders.map((o) => {
              const statusKey = o.status?.toUpperCase?.() || "READYPAY";
              const orderTotal =
                o.items?.reduce((sum, item) => sum + item.price, 0) || 0;

              return (
                <Paper
                  key={o.numPurG}
                  sx={{
                    mb: 1.5,
                    p: isMobile ? 1.2 : 1.5,
                    borderRadius: "14px",
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: SHADOWS.soft,
                    "&:hover": {
                      backgroundColor: "#fafafa",
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => navigate(`/user/mypage/order/${o.numPurG}`)}
                >
                  {/* 주문 상단 정보 */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    sx={{ mb: 1 }}
                    spacing={isMobile ? 0.5 : 0}
                  >
                    <Box>
                      <Typography
                        sx={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        주문번호 {o.numPurG}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: COLORS.textSub,
                          mt: 0.3,
                        }}
                      >
                        {dayjs(o.created).format("YYYY-MM-DD HH:mm")}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mt: { xs: 0.5, sm: 0 } }}
                    >
                      <Chip
                        label={STATUS[statusKey]}
                        size="small"
                        sx={{
                          fontSize: "11px",
                          bgcolor: ORDER_COLORS[statusKey],
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: COLORS.primaryStrong,
                        }}
                      >
                        총 {orderTotal.toLocaleString()}원
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* 주문 내 상품 리스트 */}
                  {o.items.map((item, idx) => {
                    const itemStatusKey =
                      item.status?.toUpperCase?.() ||
                      o.status?.toUpperCase?.() ||
                      "READYPAY";

                    if (isMobile) {
                      // 🔹 모바일 카드 레이아웃
                      return (
                        <Stack
                          key={`${o.numPurG}-${item.numPurD}`}
                          direction="row"
                          spacing={1.2}
                          sx={{
                            pt: idx === 0 ? 8 / 16 : 1,
                            borderTop:
                              idx === 0
                                ? `1px solid ${
                                    COLORS.borderSoft || COLORS.border
                                  }`
                                : `1px solid ${
                                    COLORS.borderSoft || COLORS.border
                                  }`,
                          }}
                        >
                          <Box sx={{ width: 72, flexShrink: 0 }}>
                            <img
                              src={item.board.thumbnail}
                              alt=""
                              style={{
                                width: "100%",
                                height: "72px",
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                            />
                          </Box>

                          <Stack spacing={0.3} sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: COLORS.textMain,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.board?.subject}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: "12px",
                                color: COLORS.textSub,
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.option?.name || "-"}
                            </Typography>

                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mt: 0.5 }}
                            >
                              <Typography
                                sx={{ fontSize: "12px", color: COLORS.textSub }}
                              >
                                {item.quantity}개
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "13px",
                                  fontWeight: 600,
                                }}
                              >
                                {item.price.toLocaleString()}원
                              </Typography>
                            </Stack>

                            <Stack
                              direction="row"
                              justifyContent="flex-end"
                              sx={{ mt: 0.3 }}
                            >
                              <Chip
                                label={STATUS[itemStatusKey]}
                                size="small"
                                sx={{
                                  fontSize: "11px",
                                  bgcolor: ORDER_COLORS[itemStatusKey],
                                }}
                              />
                            </Stack>
                          </Stack>
                        </Stack>
                      );
                    }

                    // 🔹 PC 레이아웃 (기존 테이블형)
                    return (
                      <Stack
                        key={`${o.numPurG}-${item.numPurD}`}
                        direction="row"
                        alignItems="center"
                        sx={{
                          py: 1,
                          borderTop: `1px solid ${
                            COLORS.borderSoft || COLORS.border
                          }`,
                          fontSize: "13px",
                        }}
                      >
                        <Box sx={{ flex: 1.2, textAlign: "center" }}>
                          <img
                            src={item.board.thumbnail}
                            alt=""
                            style={{ maxWidth: 75, maxHeight: 75 }}
                          />
                        </Box>

                        <Box sx={{ flex: 4 }}>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: COLORS.textMain,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              wordBreak: "break-word",
                              mr: 3,
                            }}
                          >
                            {item.board?.subject}
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 2 }}>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: COLORS.textMain,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              wordBreak: "break-word",
                              textAlign: "left",
                              mr: 3,
                            }}
                          >
                            {item.option?.name
                              ? item.option.name.length > 15
                                ? item.option.name.substring(0, 15) + "..."
                                : item.option.name
                              : "-"}
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{ fontSize: "13px", textAlign: "center" }}
                          >
                            {item.quantity}개
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1.4 }}>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              textAlign: "center",
                              fontWeight: 600,
                            }}
                          >
                            {item.price.toLocaleString()}원
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1.4, textAlign: "center" }}>
                          <Chip
                            label={STATUS[itemStatusKey]}
                            size="small"
                            sx={{
                              fontSize: "12px",
                              bgcolor: ORDER_COLORS[itemStatusKey],
                            }}
                          />
                        </Box>
                      </Stack>
                    );
                  })}
                </Paper>
              );
            })}
          </Box>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            shape="rounded"
            color="primary"
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default BuyerOrdersTab;
