// src/components/producer/ProducerSettlementPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getSettlement } from "../../../service/MemberService";

const statusLabel = {
  DONE: "정산완료",
  SCHEDULED: "정산예정",
  HOLD: "보류",
};

const statusColor = {
  DONE: "success",
  SCHEDULED: "info",
  HOLD: "warning",
};

const StatCard = ({ label, value, sub }) => (
  <Paper
    sx={{
      p: 2,
      borderRadius: 2,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
    }}
  >
    <Typography variant="body2" sx={{ color: "#888", mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 700 }}>
      {(value ?? 0).toLocaleString()}원
    </Typography>
    {sub && (
      <Typography variant="caption" sx={{ color: "#999" }}>
        {sub}
      </Typography>
    )}
  </Paper>
);

// 날짜 포맷터
const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ko-KR");
};

// 연/월 선택용 상수
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1;

// 최근 5년 정도만 노출
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
// 1~12월
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

const SettlementPage = () => {
  const { COLORS } = useOutletContext() || {};

  const [summary, setSummary] = useState({
    monthSales: 0,
    weeklySettlement: 0,
    totalSettlement: 0,
  });
  const [settlements, setSettlements] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartMode, setChartMode] = useState("WEEKLY");

  // 🔹 연/월 필터 state – 기본값은 현재 연/월
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);

  const loadData = async (options = {}) => {
    try {
      const {
        year: y = year,
        month: m = month,
        mode = chartMode,
      } = options;

      const res = await getSettlement({
        year: y,
        month: m,
        mode,
      });

      setSummary({
        monthSales: res.monthSales ?? 0,
        weeklySettlement: res.weeklySettlement ?? 0,
        totalSettlement: res.totalSettlement ?? 0,
      });

      setSettlements(res.settlement || []);

      const chart = (res.chart || []).map((c) => ({
        name: c.label,
        amount: c.amount,
      }));
      setChartData(chart);

      setChartMode(res.chartMode || mode);
    } catch (e) {
      console.error(e);
      alert("정산 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  };

  // 첫 로딩: 현재 연/월 기준, WEEKLY
  useEffect(() => {
    loadData({ year: CURRENT_YEAR, month: CURRENT_MONTH, mode: "WEEKLY" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 주별 / 월별 버튼 클릭
  const handleModeChange = (mode) => {
    setChartMode(mode);
    loadData({ year, month, mode });
  };

  // 🔹 연/월 변경 핸들러
  const handleYearChange = (e) => {
    const newYear = Number(e.target.value) || null;
    setYear(newYear);
    loadData({ year: newYear, month, mode: chartMode });
  };

  const handleMonthChange = (e) => {
    const newMonth = Number(e.target.value) || null;
    setMonth(newMonth);
    loadData({ year, month: newMonth, mode: chartMode });
  };

  // 🔹 “이번 달”로 리셋 버튼
  const handleResetToThisMonth = () => {
    setYear(CURRENT_YEAR);
    setMonth(CURRENT_MONTH);
    loadData({ year: CURRENT_YEAR, month: CURRENT_MONTH, mode: chartMode });
  };

  return (
    <Box>
      {/* 상단 타이틀 + 월 선택 필터 */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            정산 관리
          </Typography>
          <Typography variant="body2" sx={{ color: "#777", mt: 0.5 }}>
            선택한 월의 매출과 정산 예정/완료 내역을 확인할 수 있어요.
          </Typography>
        </Box>

        {/* 🔹 연/월 선택 필터 영역 */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            select
            label="연도"
            value={year || ""}
            onChange={handleYearChange}
            sx={{ minWidth: 90 }}
          >
            {YEAR_OPTIONS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}년
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="월"
            value={month || ""}
            onChange={handleMonthChange}
            sx={{ minWidth: 80 }}
          >
            {MONTH_OPTIONS.map((m) => (
              <MenuItem key={m} value={m}>
                {m}월
              </MenuItem>
            ))}
          </TextField>

          <Button size="small" onClick={handleResetToThisMonth}>
            이번 달
          </Button>
        </Stack>
      </Box>

      {/* 요약 카드 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            label="이번 달 총 정산금액"
            value={summary.monthSales}
            sub="PG 수수료 차감 후 금액"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            label="다음 주(월) 정산 예정금"
            value={summary.weeklySettlement}
            sub="취소/환불 반영 후 정산 예정"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            label="누적 정산금액"
            value={summary.totalSettlement}
            sub="가입 후 지금까지"
          />
        </Grid>
      </Grid>

      {/* 매출 / 정산 비교 그래프 */}
      <Paper
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {chartMode === "MONTHLY"
              ? "월별 정산 금액 비교"
              : "주별 정산 금액 비교"}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant={chartMode === "WEEKLY" ? "contained" : "text"}
              onClick={() => handleModeChange("WEEKLY")}
            >
              주별
            </Button>
            <Button
              size="small"
              variant={chartMode === "MONTHLY" ? "contained" : "text"}
              onClick={() => handleModeChange("MONTHLY")}
            >
              월별
            </Button>
          </Stack>
        </Stack>

        {chartData.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: "#888", py: 4, textAlign: "center" }}
          >
            그래프로 표시할 정산 내역이 없습니다.
          </Typography>
        ) : (
          <Box sx={{ width: "100%", height: 260 , overflowX: "auto"}}>
            {(() => {
              const BAR_UNIT_WIDTH = 60;
              const minWidth = 400; // 데이터가 적어도 최소 400px
              const innerWidth = Math.max(
                chartData.length * BAR_UNIT_WIDTH,
                minWidth
              );

              return (
                <Box sx={{ width: innerWidth, height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        angle={-20}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(value) =>
                          `${Number(value).toLocaleString()}원`
                        }
                      />
                      <Bar
                        dataKey="amount"
                        radius={[4, 4, 0, 0]}
                        fill={COLORS?.primaryStrong || "#FF9F56"} // 🔹 막대 색
                        barSize={30} // 막대 두께 (원하면 조절)
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              );
            })()}
          </Box>
        )}
      </Paper>

      <Divider sx={{ mb: 2 }} />

      {/* 정산 내역 테이블 */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        정산 내역
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center" width={60}>
                번호
              </TableCell>
              <TableCell>매출 기간</TableCell>
              <TableCell>정산 예정일</TableCell>
              <TableCell align="right">정산 금액</TableCell>
              <TableCell align="center">상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {settlements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    정산 내역이 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              settlements.map((s, idx) => (
                <TableRow key={s.settlementId || idx} hover>
                  <TableCell align="center">{idx + 1}</TableCell>
                  <TableCell>
                    {s.periodStart && s.periodEnd
                      ? `${s.periodStart} ~ ${s.periodEnd}`
                      : "-"}
                  </TableCell>
                  <TableCell>{formatDate(s.scheduleDate)}</TableCell>
                  <TableCell align="right">
                    {s.settlementAmount?.toLocaleString()}원
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={statusLabel[s.status] || s.status || "-"}
                      color={statusColor[s.status] || "default"}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack spacing={0.5} sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: "#999" }}>
          • 정산 주기 및 기준은 입점 계약 조건에 따라 달라질 수 있습니다.
        </Typography>
        <Typography variant="caption" sx={{ color: "#999" }}>
          • 정산 보류 내역이 있는 경우, 고객센터 또는 담당 매니저에게 문의해 주세요.
        </Typography>
      </Stack>
    </Box>
  );
};

export default SettlementPage;
