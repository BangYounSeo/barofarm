import React from 'react';
import { Box, Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Text, ResponsiveContainer } from "recharts";


const GaugeChart = ({ currentPrice, referencePrice }) => {
  const diffPercent = ((currentPrice - referencePrice) / referencePrice) * 100;
  const isAbove = currentPrice > referencePrice;
  const value = Math.min(Math.abs(diffPercent), 100);

    const diff = currentPrice - referencePrice;
    const ArrowIcon = diff >= 0 ? "▲" : "▼";
    const color = diff >= 0 ? "#f44336" : "#2196f3";

  const data = [
    { value: value, color: isAbove ? "#f44336" : "#2196f3" },
    { value: 100 - value, color: "#e0e0e0" }
  ];

  return (
   <Card sx={{ width: "100%", height: "200px", textAlign: "center" }}>
  <CardContent sx={{ p: 1 }}>
    <Box sx={{ position: "relative", width: "100%", height: "180px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            startAngle={isAbove ? 180 : 0}
            endAngle={isAbove ? 0 : 180}
            innerRadius="70%"
            outerRadius="100%"
            dataKey="value"
            cx="50%"
            cy="50%"
            label={({ cx, cy }) => (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 15 }}
              >
                {`${referencePrice}원`}
              </text>
            )}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* 글자를 차트 밑쪽 중앙에 overlay */}
      <Typography
        sx={{
          position: "absolute",
          width: "100%",
          textAlign: "center",
          bottom: 0,
          fontSize: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "5px" // 아이콘과 텍스트 사이 간격
        }}
      >
        <span style={{ color: color }}>{diff}</span>원 {isAbove ? "증가" : "감소"} 
        <span style={{ color: color }}>{diffPercent.toFixed(1)}%</span>
        <span style={{ color: color }}>{ArrowIcon}</span>
      </Typography>
      </Box>
  </CardContent>
</Card>
  );
};

export default GaugeChart;