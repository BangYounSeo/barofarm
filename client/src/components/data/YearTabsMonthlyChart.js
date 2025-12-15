import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box, Tabs, Tab, Button, Paper, Typography, useMediaQuery, useTheme, Card, CardContent } from "@mui/material";
import MonthlyDataTable from "./MonthlyDataTable";
import YearAvgLineChart from "./YearAvgLineChart";

export default function YearTabsMonthlyChart({ data}) {
  const halfData = data?.slice(0, 5) ?? [];
  const [tab, setTab] = useState(0);
  const [chartType, setChartType] = useState("bar");
  const isMobile = useMediaQuery("(max-width:600px)");
  useEffect(() => {
    setTab(0);
  }, [data]);


  const years = useMemo(() => halfData || [], [halfData]);
  const selected = years[tab] || {};
  const prev = years[tab - 1] || {};
  const next = years[tab + 1] || {};

  const allRecent5YearAvg = useMemo(() => {
    if (!data || data.length === 0) return [];
    const result = [];
    for (let i = 0; i <= 4; i++) {
      const d = data[i];
      if (!d || !d.year) continue; 
      const currentYear = Number(d.year);
      if (!currentYear) continue;

      const targetYears = Array.from({ length: 5 }, (_, j) => currentYear - (j + 1));
      const recentData = data.filter(rd => targetYears.includes(Number(rd.year)));
      if (recentData.length === 0) continue;

      const months = Array.from({ length: 12 }, (_, j) => `m${j + 1}`);
      const monthlyAvg = {};
      months.forEach(m => {
        const prices = recentData
          .map(rd => rd[m] === "-" ? null : Number(rd[m]))
          .filter(v => v != null);
        monthlyAvg[m] = prices.length > 0
          ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
          : null;
      });

      const yearAvgList = recentData
        .map(rd => rd.yearAvg === "-" ? null : Number(rd.yearAvg))
        .filter(v => v != null);
      const yearAvg = yearAvgList.length > 0
        ? Math.round(yearAvgList.reduce((a, b) => a + b, 0) / yearAvgList.length)
        : null;

      result.push({ year: currentYear, targetYears, monthlyAvg, yearAvg });
    }
    return result;
  }, [data]);

  const monthlyData = useMemo(() => {
    if (!selected) return [];
    const months = Array.from({ length: 12 }, (_, i) => `m${i + 1}`);
    const toNumberOrNull = val => {
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    return months.map((m, idx) => {
      const price = selected[m] === "-" ? null : toNumberOrNull(selected[m]);
      const prevPrice = prev[m] === "-" || prev[m] == null ? null : toNumberOrNull(prev[m]);
      const nextPrice = next[m] === "-" || next[m] == null ? null : toNumberOrNull(next[m]);

      const monthAvgData = allRecent5YearAvg.find(d => d.year === Number(selected.year));
      const monthlyAvg = monthAvgData?.monthlyAvg?.[m];
      const safeMonthlyAvg = monthlyAvg == null || isNaN(monthlyAvg) ? null : monthlyAvg;

      const yearAvg = selected.yearAvg === "-" ? null : toNumberOrNull(selected.yearAvg);
      const prevYearAvg = prev.yearAvg === "-" ? null : toNumberOrNull(prev.yearAvg);
      const nextYearAvg = next.yearAvg === "-" ? null : toNumberOrNull(next.yearAvg);

      const diffPrev = prevPrice != null && price != null ? price - prevPrice : null;
      const ratePrev = diffPrev != null ? ((diffPrev / prevPrice) * 100).toFixed(1) : null;
      const diffNext = nextPrice != null && price != null ? price - nextPrice : null;
      const rateNext = diffNext != null ? ((diffNext / nextPrice) * 100).toFixed(1) : null;
      const diffAvg = safeMonthlyAvg != null && price != null ? price - safeMonthlyAvg : null;
      const rateAvg = diffAvg != null ? ((diffAvg / safeMonthlyAvg) * 100).toFixed(1) : null;

      

      return {
        month: `${idx + 1}월`,
        price,
        prevPrice,
        nextPrice,
        monthlyAvg: safeMonthlyAvg,
        yearAvg,
        prevYearAvg,
        nextYearAvg,
        diffPrev,
        ratePrev,
        diffNext,
        rateNext,
        diffAvg,
        rateAvg,
      };
    });
  }, [selected, prev, next, allRecent5YearAvg]);

  const yValues = monthlyData.flatMap(d =>
    [d.price, d.prevPrice, d.nextPrice, d.monthlyAvg, d.yearAvg].filter(v => v != null && isFinite(v))
  );
  const yMin = yValues.length ? Math.floor(Math.max(0, Math.min(...yValues) * 0.95)) : 0;
  const yMax = yValues.length ? Math.ceil(Math.max(...yValues) * 1.05) : 100;

  const yearAvg = halfData.map(item => ({ year: item.year, avg: item.yearAvg }));
  const commonYearAvg = allRecent5YearAvg.map(item => ({ commonYear: item.year, commonYearAvg: item.yearAvg }));


  // 툴팁 컴포넌트 유지
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const { price, prevPrice, nextPrice, monthlyAvg, diffPrev, ratePrev, diffNext, rateNext, diffAvg, rateAvg } = payload[0].payload;
      const formatWithSign = (diff, val) => {
        if (val == null) return "-";
        if (diff == null) return val.toLocaleString();
        return (diff > 0 ? "+" : "-") + Math.abs(val).toLocaleString();
      };
      const getColor = val => (val > 0 ? "#FF4D4F" : "#1890FF");
      const getIcon = val => (val > 0 ? "▲" : "▼");

      return (
        <Paper sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.95)", boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>가격: {price?.toLocaleString() ?? "-"}</Typography>
          {diffPrev != null && <Typography variant="body2" sx={{ color: getColor(diffPrev) }}>내년 대비: {formatWithSign(diffPrev, diffPrev)} ({Math.abs(ratePrev)}%) {getIcon(diffPrev)}</Typography>}
          {diffNext != null && <Typography variant="body2" sx={{ color: getColor(diffNext) }}>전년 대비: {formatWithSign(diffNext, diffNext)} ({Math.abs(rateNext)}%) {getIcon(diffNext)}</Typography>}
          {diffAvg != null && <Typography variant="body2" sx={{ color: getColor(diffAvg) }}>평년 대비: {formatWithSign(diffAvg, diffAvg)} ({Math.abs(rateAvg)}%) {getIcon(diffAvg)}</Typography>}
        </Paper>
      );
    }
    return null;
  };


 const BarCustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    const p = payload[0].payload;

    const regionPrice = payload[0].value; // 이번 달 가격
    const day = p.regday ?? label;

    const {
      diffPrev, // 전년 대비
      ratePrev,
      diffNext, // 내년 대비
      rateNext,
      yearAvg // 연평균
    } = p;

    const totalPrice = yearAvg ?? null;
    const diffYear = totalPrice != null ? regionPrice - totalPrice : null;
    const percentYear = totalPrice != null ? ((diffYear / totalPrice) * 100).toFixed(1) : null;

    const getColor = val => (val >= 0 ? theme.palette.error.main : theme.palette.primary.main);
    const getSign = val => (val >= 0 ? "+" : "-");
    const getArrow = val => (val >= 0 ? "▲" : "▼");

    return (
      <Card variant="outlined" sx={{ p: 0.5, background: theme.palette.background.paper, boxShadow: 3 }}>
        <CardContent sx={{ p: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">{label}</Typography>
          <Typography variant="body2" color="text.secondary">날짜: {day}</Typography>
          <Typography variant="body2">가격: {regionPrice?.toLocaleString()}원</Typography>

          {/* 전년 대비 */}
          {diffNext != null && (
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", color: getColor(diffNext) }}
            >
              전년 대비: {getSign(diffNext)}
              {Math.abs(diffNext).toLocaleString()}원 ({getSign(diffNext)}
              {Math.abs(rateNext)}%) 
              <span style={{ marginLeft: 4 }}>{getArrow(diffNext)}</span>
            </Typography>
          )}

          {/* 내년 대비 */}
          {diffPrev != null && (
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", color: getColor(diffPrev) }}
            >
              내년 대비: {getSign(diffPrev)}
              {Math.abs(diffPrev).toLocaleString()}원 ({getSign(diffPrev)}
              {Math.abs(ratePrev)}%) 
              <span style={{ marginLeft: 4 }}>{getArrow(diffPrev)}</span>
            </Typography>
          )}

          {/* 연평균 대비 — 기존 유지 */}
          {diffYear != null && (
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", color: getColor(diffYear) }}
            >
              연평균 대비: {getSign(diffYear)}
              {Math.abs(diffYear).toLocaleString()}원 ({getSign(diffYear)}
              {Math.abs(percentYear)}%) 
              <span style={{ marginLeft: 4 }}>{getArrow(diffYear)}</span>
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};


  return (
    <Box>
      {years.length > 0 && (
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto" 
          allowScrollButtonsMobile >
          {years.map((d, i) => <Tab key={i} label={d.year} />)}
        </Tabs>
      )}

      <Box sx={{ mb: 2 ,display:"flex", justifyContent: { xs: "center", sm: "flex-start" }  }}>
        <Button variant={chartType === "bar" ? "contained" : "outlined"} onClick={() => setChartType("bar")}>Bar Chart</Button>
        <Button variant={chartType === "line" ? "contained" : "outlined"} onClick={() => setChartType("line")} sx={{ ml: 1 }}>Line Chart</Button>
      </Box>

      {/* 차트와 범례 flex 배치 */}
      <Box sx={{ width: "100%", height: 450, display: "flex", flexDirection: "column", mb: 4 }}>
        {/* 범례 */}
        {chartType === "line" && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 1, flexWrap: "wrap", bgcolor: "rgba(255,255,255,0.8)", p: 1, borderRadius: 1, boxShadow: 1 }}>
            {["선택연도", "전년", "내년", "평년"].map((label, i) => {
              const colors = ["#1890FF", "#FF4D4F", "#FAAD14", "#52C41A"];
              return (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 2, bgcolor: colors[i] }} />
                  <Typography variant="caption">{label}</Typography>
                </Box>
              );
            })}
          </Box>
        )}
        {chartType === "bar" && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1, bgcolor: "rgba(255,255,255,0.8)", p: 1,  }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 12, height: 2, bgcolor: "#52C41A" }} />
              <Typography variant="caption">연평균: {selected.yearAvg?.toLocaleString() ?? "-"}</Typography>
            </Box>
          </Box>
        )}

        {/* 차트 */}
       
          {chartType === "line" ? (
             <ResponsiveContainer width="100%" height="100%" >
            <LineChart data={monthlyData} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
              <XAxis dataKey="month" axisLine={{ stroke: "#ccc" }} tickLine={false} />
              <YAxis axisLine={{ stroke: "#ccc" }} tickLine={false} domain={[yMin, yMax]} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1890FF" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#1890FF" stopOpacity={0.5}/>
                </linearGradient>
                <linearGradient id="prevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4D4F" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#FF4D4F" stopOpacity={0.5}/>
                </linearGradient>
                <linearGradient id="nextGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FAAD14" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#FAAD14" stopOpacity={0.5}/>
                </linearGradient>
                <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#52C41A" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#52C41A" stopOpacity={0.5}/>
                </linearGradient>
              </defs>
              <Line type="monotone" dataKey="price" stroke="url(#priceGradient)" strokeWidth={4} dot={{ r: 6, fill: "#1890FF", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 8, fill: "#1890FF", stroke: "#fff", strokeWidth: 3 }} />
              <Line type="monotone" dataKey="nextPrice" stroke="url(#prevGradient)" strokeWidth={3.5} dot={{ r: 5, fill: "#FF4D4F", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#FF4D4F", stroke: "#fff", strokeWidth: 2 }} />
              <Line type="monotone" dataKey="prevPrice" stroke="url(#nextGradient)" strokeWidth={3.5} dot={{ r: 5, fill: "#FAAD14", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#FAAD14", stroke: "#fff", strokeWidth: 2 }} />
              <Line type="monotone" dataKey="monthlyAvg" stroke="url(#avgGradient)" strokeWidth={3} dot={{ r: 5, fill: "#52C41A", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#52C41A", stroke: "#fff", strokeWidth: 2 }} />
            </LineChart>
            </ResponsiveContainer>
          ) : (
             <ResponsiveContainer width="100%" height={isMobile ? Math.max(monthlyData.length * 50, 300) : "100%"}>
            <BarChart data={monthlyData}  margin={{ top: 30, right: 30, left: 0, bottom: 20 }} layout={isMobile ? "vertical" : "horizontal"}>
              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
               {isMobile ? (
      <>
        {/* 가로형: Y축 = 카테고리(월), X축 = 값(가격) */}
        <YAxis
          type="category"
          dataKey="month"
          axisLine={{ stroke: "#ccc" }}
          tickLine={false}
          width={40} // 월 이름 충분히 표시
        />
        <XAxis
          type="number"
          axisLine={{ stroke: "#ccc" }}
          tickLine={false}
          domain={[yMin, yMax]}
        />
      </>
    ) : (
      <>
        {/* 세로형: 기존 */}
        <XAxis dataKey="month" axisLine={{ stroke: "#ccc" }} tickLine={false} />
        <YAxis axisLine={{ stroke: "#ccc" }} tickLine={false} domain={[yMin, yMax]} />
      </>
    )}
              <Tooltip content={<BarCustomTooltip />} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1890FF" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#1890FF" stopOpacity={0.5}/>
                </linearGradient>
              </defs>
              <Bar dataKey="price" fill="url(#barGradient)"  radius={isMobile ? [0, 12, 12, 0] : [12, 12, 0, 0]} animationDuration={1000} />
              <Line type="monotone" dataKey="yearAvg" stroke="#52C41A" strokeWidth={3} dot={{ r: 4, fill: "#52C41A", stroke: "#fff", strokeWidth: 1 }} />
            </BarChart>
            </ResponsiveContainer>
          )}
        
      </Box>

      {/* 테이블 */}
      <Box sx={{ mt: chartType === "line" ? 4 : { sm: 4, xs: 30 } }}>
  <MonthlyDataTable monthlyData={monthlyData} chartType={chartType} />
</Box>

      {/* 연평균 라인 차트 */}
      <Box sx={{ mt: 4 }}>
        <YearAvgLineChart yearAvg={yearAvg} commonYearAvg={commonYearAvg} />
      </Box>
    </Box>
  );
}