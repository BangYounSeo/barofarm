import React, { useState } from "react";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label,
} from "recharts";
import { Box, Button, Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// 커스텀 툴팁
const CustomTooltip = ({ active, payload, label, totalPrice }) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    const regionPrice = payload[0].value;
    const day = payload[0].payload.regday;
    const diff = regionPrice - totalPrice;
    const percent = ((diff / totalPrice) * 100).toFixed(1);
    const ArrowIcon = diff >= 0 ? ArrowDropUpIcon : ArrowDropDownIcon;
    const color = diff >= 0 ? theme.palette.error.main : theme.palette.primary.main;
    const sign = diff >= 0 ? "+" : "-";

    return (
      <Card variant="outlined" sx={{ p: 0.5, background: theme.palette.background.paper, boxShadow: 3 }}>
        <CardContent sx={{ p: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">{label}</Typography>
          <Typography variant="body2" color="text.secondary">날짜: {day}</Typography>
          <Typography variant="body2">가격: {regionPrice.toLocaleString()}원</Typography>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", color }}>
            전국 평균 대비: {sign}{Math.abs(diff).toLocaleString()}원 ({sign}{Math.abs(percent)}%) 
            <ArrowIcon sx={{ color, ml: 0.5 }} />
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return null;
};

const RegionBarChart = ({ data }) => {
  const theme = useTheme();
 const isMobile = useMediaQuery("(max-width:600px)");

    const [visibleCount, setVisibleCount] = useState(5); // 처음 5개만
  const handleLoadMore = () => setVisibleCount(prev => prev + 5);
  const handleLoadReset = () => setVisibleCount(5);

  // 전체 가격
  const totalData = data.find(d => d.regionName === "전체");
  const totalPrice = totalData ? Number(totalData.dpr1) : 0;


  // 전체 제외, 숫자 변환
  const regionData = data.length !== 2 ? data
    .filter(d => d.regionName !== "전체")
    .map(d => ({ ...d, dpr1: Number(d.dpr1) })) : data.map(d => ({ ...d, dpr1: Number(d.dpr1) }));

  // 색상 그라데이션 함수
  const getBarColor = (value) => {
    const max = Math.max(...regionData.map(d => d.dpr1));
    const min = Math.min(...regionData.map(d => d.dpr1));
    const ratio = (value - min) / (max - min + 1); // 0~1
    return `rgba(33, 150, 243, ${0.4 + ratio * 0.6})`; // 밝기 조절
  };

  // 화살표 아이콘
const Arrow = ({ up }) => (
  <span
    style={{
      color: up ? "#FF4D4F" : "#1890FF",
      marginLeft: 5,
      fontWeight: "bold",
      fontSize: 14,
    }}
  >
    {up ? "▲" : "▼"}
  </span>
);

// 가격 차이 계산 함수
const diff = (current, prev) => {
  if (prev === undefined || prev === null) return null;
  const difference = current - prev;
  const percent = ((difference / prev) * 100).toFixed(1); // 퍼센트 계산
  if (difference > 0) return { value: `+${difference}`, percent: `+${percent}%`, up: true };
  if (difference < 0) return { value: `${difference}`, percent: `${percent}%`, up: false };
  return { value: "0", percent: "0%", up: null };
};

const renderPriceWithDiff = (value, compareTo) => {
  if (value === undefined || value === null) return "-";
  const d = diff(compareTo, value); // 오늘 가격과 비교
  return (
    <span style={{ color: d?.up === null ? "#555" : d.up ? "#FF4D4F" : "#1890FF" }}>
      {value} {d && `(${d.percent})`} {d?.up !== null && <Arrow up={d.up} />}
    </span>
  );
};

const tableData = [...data].sort((a, b) => {
  if (a.regionName === "전체") return -1; // a가 전체면 맨 위
  if (b.regionName === "전체") return 1;  // b가 전체면 a 뒤로
  return 0; // 나머지는 순서 유지
});

const yValues = regionData.flatMap(d => [d.dpr1].filter(v => v != null && isFinite(v)));
const yMin = yValues.length ? Math.floor(Math.max(0, Math.min(...yValues) * 0.95)) : 0;
const yMax = yValues.length ? Math.ceil(Math.max(...yValues) * 1.05) : 100;

  return (
    <Box>
  <CardContent>
    { data.length !== 2 ? (
    <ResponsiveContainer width="100%" height={isMobile ? Math.max(regionData.length * 50, 300) : 450} >
      <BarChart data={regionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      layout={isMobile ? "vertical" : "horizontal"} >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        {isMobile ? (
      <>
        {/* Y축 = 지역명 */}
        <YAxis
          type="category"
          dataKey="regionName"
          tick={{ fill: theme.palette.text.primary }}
          width={20}
        />

        {/* X축 = 가격 */}
        <XAxis
          type="number"
          tick={{ fill: theme.palette.text.primary }}
          domain={[yMin, yMax]}
        />
      </>
    ) : (
      <>
        {/* 기존 PC용 축 */}
        <XAxis
          dataKey="regionName"
          tick={{ fill: theme.palette.text.primary }}
        />
        <YAxis
          tick={{ fill: theme.palette.text.primary }}
          domain={[yMin, yMax]}
        />
      </>
    )}
        <Tooltip content={<CustomTooltip totalPrice={totalPrice} />} />
        <Bar dataKey="dpr1" name="지역별 가격" radius={isMobile ? [0, 5, 5, 0] : [5, 5, 0, 0]} >
          {regionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.dpr1)} />
          ))}
        </Bar>
        {regionData.length !== 2 && (
          <Line
            type="monotone"
            dataKey={()=>totalPrice}
            stroke={theme.palette.error.main}
            name="전체"
            dot={false}
            strokeDasharray="5 5"
          >
            <Label
              value={`-- 전국 평균 : ${totalPrice}원`}
              position="insideTopRight"
              fill={theme.palette.error.main}
              offset={0}
              fontSize={14}
            />
          </Line>
        )}
      </BarChart>
    </ResponsiveContainer>
    ) :(
      <ResponsiveContainer width="100%" height={450}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey="regionName" tick={{ fill: theme.palette.text.primary }} />
        <YAxis
  tick={{ fill: theme.palette.text.primary }}
  domain={[yMin, yMax]}
/>
        <Tooltip content={<CustomTooltip totalPrice={totalPrice} />} />
        <Bar dataKey="dpr1" name="지역별 가격" radius={[5, 5, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.dpr1)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    )

    }

    {/* 테이블 */}
    <TableContainer component={Paper} sx={{ mt: 3 ,overflowX:"auto"}}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ whiteSpace: "nowrap" }}>지역</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>날짜</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>가격</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>전일</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>1주전</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>1달전</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.slice(0,visibleCount).map((d, i) => (
            <TableRow key={i}>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{d.regionName}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{d.regday}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{d.dpr1}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{renderPriceWithDiff(d.dpr2, d.dpr1)}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{renderPriceWithDiff(d.dpr3, d.dpr1)}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{renderPriceWithDiff(d.dpr5, d.dpr1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

    </TableContainer>
    <Box sx={{ textAlign: "center", mt: 1 }}>
  {visibleCount < tableData.length ? (
    <Box sx={{ textAlign: "center", p: 2 }}>
      <Button
        variant="contained"
        onClick={handleLoadMore}
        sx={{
          px: 3,
          py: 1,
          borderRadius: 3,
          fontWeight: "bold",
          boxShadow: 2,
          backgroundColor: "#1976d2",
          "&:hover": { backgroundColor: "#125ea9" }
        }}
      >
        더보기
      </Button>
    </Box>
  ) : (
    <Box sx={{ textAlign: "center", p: 2 }}>
      <Button
        variant="outlined"
        onClick={handleLoadReset}
        sx={{
          px: 3,
          py: 1,
          borderRadius: 3,
          fontWeight: "bold",
          boxShadow: 1,
          borderColor: "#1976d2",
          color: "#1976d2",
          "&:hover": {
            borderColor: "#125ea9",
            color: "#125ea9",
            backgroundColor: "rgba(25, 118, 210, 0.05)"
          }
        }}
      >
        접기
      </Button>
    </Box>
  )}
</Box>

  </CardContent>
</Box>
  );
};

export default RegionBarChart;
