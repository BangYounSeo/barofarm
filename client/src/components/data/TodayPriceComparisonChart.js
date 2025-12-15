import React from "react";
import { Typography, Box } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  Cell,
} from "recharts";

// 커스텀 툴팁
const CustomTooltip = ({ active, payload,label,today }) => {
  if (active && payload && payload.length) {
    const p = payload[0];
    const value = p.value ?? 0;
    const isToday = p.payload.name == "최근 가격";

    return (
      <Box sx={{ p: 1, backgroundColor: "#f5f5f5", boxShadow: 2, borderRadius: 1 }}>

        {isToday &&
          <Typography variant="body2" sx={{ mt: 0.5, fontSize: 12, color: "#555" }}>
           날짜: {today}
        </Typography>
        }

        <Typography variant="body2" sx={{ color: p.fill, fontWeight: 500 }}>
          {p.name}: {value.toLocaleString()}원
        </Typography>

      </Box>
    );
  }
  return null;
};

const PriceBarWithMaxMin = ({ todayPrice,today, yearAvg, yearMax, yearMin ,rank}) => {
  const safeToday = Number(todayPrice) || 0;
const safeAvg = Number(yearAvg) || 0;
const safeMax = Number(yearMax) || 1; // 0이면 yMax가 0이 되어 차트가 이상해질 수 있음
const safeMin = Number(yearMin) || 0;

  const data = [
    { name: "최근 가격", value: safeToday },
    { name: "평균 가격", value: safeAvg },
  ];

  const yMin = 0;
  const yMax = safeMax * 1.1;

  return (
    <Box sx={{  pt: 5,}}>
      <Box sx={{ml:5}}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        등급 : {rank}
      </Typography>
      <Box sx={{display: "flex",
            gap:3,
            flexDirection: "row",
            alignItems:"center"}}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        {todayPrice} 원
      </Typography>
        <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 500,
              color: todayPrice > safeAvg ? "red": todayPrice < safeAvg ? "blue"  : "black",
            }}
          >
            평균대비{" "}
            {todayPrice > safeAvg
              ? `+${(todayPrice - safeAvg).toLocaleString()}`
              : (todayPrice - safeAvg).toLocaleString()}{" "}
            원{" "}
            (
            {todayPrice > safeAvg ? "▲" : todayPrice < safeAvg ? "▼" : ""}
            {safeAvg !== 0
              ? Math.abs(((todayPrice - safeAvg) / safeAvg) * 100).toFixed(1)
              : 0}
            %
            )
        </Typography>
      </Box>
      </Box>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 30, right: 50, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
          <XAxis dataKey="name" tick={{ fontSize: 14, fill: "#555" }} />
          <YAxis domain={[yMin, yMax]} tick={{ fontSize: 14, fill: "#555" }} tickFormatter={(value) => value.toLocaleString()} />
          <Tooltip content={(props) => <CustomTooltip {...props} today={today} />} />

          <Bar dataKey="value" name="가격">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? "#8884d8" : "#82ca9d"}
                radius={[10, 10, 0, 0]}
              />
            ))}
          </Bar>

          <ReferenceLine y={safeMax} stroke="#ff7300" strokeDasharray="4 4">
            <Label
              value={`최대: ${safeMax.toLocaleString()}원`}
              position="insideTopRight"
              offset={-15}
              fill="#ff7300"
              fontSize={12}
              fontWeight="bold"
            />
          </ReferenceLine>

          <ReferenceLine y={safeMin} stroke="#387908" strokeDasharray="4 4">
            <Label
              value={`최소: ${safeMin.toLocaleString()}원`}
              position="insideTopRight"
              offset={-15}
              fill="#387908"
              fontSize={12}
              fontWeight="bold"
            />
          </ReferenceLine>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PriceBarWithMaxMin;
