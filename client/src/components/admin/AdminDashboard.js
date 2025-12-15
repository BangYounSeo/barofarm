// src/components/admin/AdminDashboard.js
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CloseIcon from "@mui/icons-material/Close";

import { fetchDashboardSummary } from "../../service/AdminService";

// AdminLayout 의 drawerWidth 와 맞춰두기
const ADMIN_DRAWER_WIDTH = 220;

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 바텀슬라이드 상태
  const [bottomOpen, setBottomOpen] = useState(false);
  const [bottomMode, setBottomMode] = useState(null); // 'best' | 'complaint' | null

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchDashboardSummary();
        setSummary(res.data);
      } catch (err) {
        console.error(err);
        setError("대시보드 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const weeklyMax = useMemo(() => {
    if (!summary?.weeklySignups || summary.weeklySignups.length === 0) return 0;
    return Math.max(...summary.weeklySignups.map((d) => d.count || 0));
  }, [summary]);

  if (loading && !summary) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !summary) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const revenue = summary?.revenue;
  const counts = summary?.counts;

  // 바텀시트에 들어갈 데이터/타이틀
  const isBest = bottomMode === "best";
  const bottomTitle = isBest
    ? "제일 많이 산 제품 TOP5"
    : "컴플레인 많은 제품 TOP5";
  const bottomDesc = isBest
    ? "구매량 기준으로 가장 많이 판매된 상품입니다."
    : "취소 · 환불이 많이 발생한 상품입니다.";
  const bottomList = isBest
    ? summary?.bestSellers || []
    : summary?.complaintTop5 || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
        관리자 대시보드
      </Typography>
      <Typography variant="body2" sx={{ mb: 2.5, color: "text.secondary" }}>
        바로팜 플랫폼의 핵심 지표를 한 눈에 확인하세요.
      </Typography>

      {/* ====== 위 3개 + 아래 TOP5 전체를 하나의 Grid container 안에 ====== */}
      <Grid container spacing={3}>
        {/* ===================== 위 3개 ===================== */}
        {/* 1) 바로팜 수익금 */}
        <Grid item xs={12} md={4} mt={3}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              borderRadius: 3,
              boxShadow: 3,
              background:
                "linear-gradient(135deg, rgba(33,150,243,0.1), rgba(0,200,83,0.1))",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <TrendingUpIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                바로팜 수익금
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              {revenue?.totalRevenue != null
                ? `${revenue.totalRevenue.toLocaleString("ko-KR")} 원`
                : "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              ※수익금은 판매대금의 2%입니다.
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Typography
              variant="subtitle2"
              sx={{ mb: 0.5, color: "text.secondary", fontWeight: 600 }}
            >
              월별 판매대금 추이              
            </Typography>

            <Stack spacing={0.5}>
              {(revenue?.monthlyRevenue || []).slice(-5).map((row) => (
                <Stack
                  key={row.yearMonth}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography variant="caption">{row.yearMonth}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {row.amount.toLocaleString("ko-KR")} 원
                  </Typography>
                </Stack>
              ))}
              {(!revenue?.monthlyRevenue ||
                revenue.monthlyRevenue.length === 0) && (
                <Typography variant="body2" color="text.disabled">
                  월별 수익 데이터가 없습니다.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* 2) 일주일간 회원가입 수 */}
        <Grid item xs={12} md={4} mt={3}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              borderRadius: 3,
              boxShadow: 3,
              background:
                "linear-gradient(135deg, rgba(156,39,176,0.08), rgba(3,169,244,0.08))",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <GroupAddIcon color="secondary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                일주일간 회원가입 수
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              최근 7일 동안의 신규 회원 가입 현황입니다.
            </Typography>

            <Box sx={{ mt: 0.5 }}>
              {(summary?.weeklySignups || []).length > 0 ? (
                <Stack spacing={0.7}>
                  {summary.weeklySignups.map((d) => {
                    const ratio =
                      weeklyMax > 0 ? (d.count / weeklyMax) * 100 : 0;
                    const label =
                      typeof d.date === "string" ? d.date : String(d.date);

                    return (
                      <Box key={label}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ mb: 0.2 }}
                        >
                          <Typography variant="caption">{label}</Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            {d.count.toLocaleString("ko-KR")} 명
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            height: 6,
                            borderRadius: 999,
                            bgcolor: "grey.200",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              width: `${ratio}%`,
                              height: "100%",
                              bgcolor: "primary.main",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.disabled">
                  최근 7일간 가입한 회원이 없습니다.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* 3) 오늘의 처리 현황 */}
        <Grid item xs={12} md={4} mt={3}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <AssignmentTurnedInIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                오늘의 처리 현황
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              관리자 업무 우선순위를 한 눈에 확인하세요.
            </Typography>

            <Stack spacing={1}>
              <SmallStatCard
                label="승인 대기 셀러"
                value={counts?.pendingSellerCount ?? 0}
                color="warning.main"
              />
              <SmallStatCard
                label="등록 상품 수"
                value={counts?.productCount ?? 0}
                color="primary.main"
              />
              <SmallStatCard
                label="오늘 주문 수"
                value={counts?.todayOrderCount ?? 0}
                color="success.main"
              />
              <SmallStatCard
                label="신고 대기 수"
                value={counts?.pendingReportCount ?? 0}
                color="error.main"
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

        {/* ===================== 아래 TOP5: 메인영역 가로 꽉 채운 2줄 ===================== */}
        <Grid item xs={12}>
          {/* 부모 Box 의 p:3(=24px)을 상쇄해서 좌우 끝까지 늘리기 */}
          <Box sx={{ mx: 0, mt: 7}}>
            <Stack spacing={3}>
              {/* 제일 많이 산 제품 TOP5 카드 (요약) */}
              <Paper
                onClick={() => {
                  setBottomMode("best");
                  setBottomOpen(true);
                }}
                sx={{                  
                  p: 1,
                  borderRadius: 3,
                  boxShadow: 3,
                  cursor: "pointer",
                  width: "97%",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-1px)",
                    transition: "all 0.15s ease",
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 0.5 }}
                >
                  <ShoppingCartIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    제일 많이 산 제품 TOP5
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  구매량 기준 베스트셀러를 확인하려면 클릭하세요.
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  총 {summary?.bestSellers?.length || 0}개 상품
                </Typography>
              </Paper>

              {/* 컴플레인 많은 제품 TOP5 카드 (요약) */}
              <Paper
                onClick={() => {
                  setBottomMode("complaint");
                  setBottomOpen(true);
                }}
                sx={{
                  p: 1,
                  borderRadius: 3,
                  boxShadow: 3,
                  cursor: "pointer",
                  width: "97%",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-1px)",
                    transition: "all 0.15s ease",
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 0.5 }}
                >
                  <ReportProblemIcon color="error" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    컴플레인 많은 제품 TOP5
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  취소·환불이 많은 상품을 확인하려면 클릭하세요.
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  총 {summary?.complaintTop5?.length || 0}개 상품
                </Typography>
              </Paper>
            </Stack>
          </Box>
        </Grid>
      {/* ===== 바텀 슬라이드 Drawer ===== */}
      <Drawer
        anchor="bottom"
        open={bottomOpen}
        onClose={() => setBottomOpen(false)}
        hideBackdrop // 레이아웃 전체 어둡게 하지 않기
        PaperProps={{
          sx: {
            // 사이드 메뉴 영역은 비워두고, 메인 영역만 차지
            left: { xs: 0, md: ADMIN_DRAWER_WIDTH },
            width: {
              xs: "100%",
              md: `calc(100% - ${ADMIN_DRAWER_WIDTH}px)`,
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            maxHeight: "60vh",
            overflow: "auto",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {isBest ? (
                <ShoppingCartIcon color="primary" fontSize="small" />
              ) : (
                <ReportProblemIcon color="error" fontSize="small" />
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {bottomTitle}
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setBottomOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {bottomDesc}
          </Typography>

          <List dense>
            {bottomList.length > 0 ? (
              bottomList.map((item, index) => (
                <React.Fragment key={item.boardId}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    secondaryAction={
                      <Stack alignItems="flex-end">
                        <Typography variant="body2">
                          {item.price.toLocaleString("ko-KR")}원
                        </Typography>
                        <Typography
                          variant="caption"
                          color={isBest ? "text.secondary" : "error.main"}
                        >
                          {isBest
                            ? `${item.count.toLocaleString("ko-KR")}개`
                            : `컴플레인 ${
                                item.count
                                  ? item.count.toLocaleString("ko-KR")
                                  : 0
                              }건`}
                        </Typography>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          spacing={0.7}
                          alignItems="center"
                        >
                          <Chip
                            label={index + 1}
                            size="small"
                            color={isBest ? "primary" : "error"}
                            variant={index === 0 ? "filled" : "outlined"}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.subject}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          판매자: {item.userId}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))
            ) : (
              <Typography variant="body2" color="text.disabled">
                {isBest
                  ? "베스트셀러 데이터가 없습니다."
                  : "컴플레인 데이터가 없습니다."}
              </Typography>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}

function SmallStatCard({ label, value, color }) {
  return (
    <Box
      sx={{
        p: 1.2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: color || "text.primary",
        }}
      >
        {Number(value).toLocaleString("ko-KR")}
      </Typography>
    </Box>
  );
}
