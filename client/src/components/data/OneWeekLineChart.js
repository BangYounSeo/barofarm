import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from "@mui/material";

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

// 커스텀 툴팁
// 커스텀 툴팁
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    const renderDiff = (prevPrice) => {
      const d = diff(data.price, prevPrice);
      if (!d) return null;

      const color = d.up === null ? "#555" : d.up ? "#FF4D4F" : "#1890FF";

      return (
        <span style={{ color, fontWeight: "bold" }}>
          {d.value} ({d.percent}) {d.up !== null && <Arrow up={d.up} />}
        </span>
      );
    };

    return (
      <Box
        sx={{
          background: "#fff",
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          borderRadius: 2,
          p: 2,
          fontSize: 13,
          minWidth: 130,
        }}
      >
        <Typography fontWeight="bold" mb={1}>{label}</Typography>

        <Typography color="#333">
          당일 가격: <strong>{data.price}</strong>
        </Typography>

        {data.prevDayPrice !== undefined && (
          <Typography color="#555">
            전일: {renderDiff(data.prevDayPrice)}
          </Typography>
        )}

        {data.prevWeekPrice !== undefined && (
          <Typography color="#555">
            1주전: {renderDiff(data.prevWeekPrice)}
          </Typography>
        )}

        {data.prevMonthPrice !== undefined && (
          <Typography color="#555">
            1달전: {renderDiff(data.prevMonthPrice)}
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};


// 표용: 가격과 퍼센트/화살표 같이 보여주기
const renderPriceWithDiff = (value, compareTo) => {
  if (value === undefined || value === null) return "-";
  const d = diff(compareTo, value); // 오늘 가격과 비교
  return (
    <span style={{ color: d?.up === null ? "#555" : d.up ? "#FF4D4F" : "#1890FF" }}>
      {value} {d && `(${d.percent})`} {d?.up !== null && <Arrow up={d.up} />}
    </span>
  );
};

const OneWeekLineChart = ({ data }) => {
  return (
    <Box>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} domain={["dataMin - 10", "dataMax + 10"]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={3}
            fill="url(#colorPrice)"
            dot={{ r: 5, fill: "#8884d8", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 8, fill: "#8884d8", stroke: "#fff", strokeWidth: 3 }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* MUI Table */}
      <TableContainer component={Paper} sx={{ mt: 3 ,overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
        <TableCell sx={{ whiteSpace: "nowrap" }}>날짜</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>가격</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>전일</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>1주전</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>1달전</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data.map((d, i) => (
        <TableRow key={i}>
          <TableCell sx={{ whiteSpace: "nowrap" }}>{d.date}</TableCell>
          <TableCell sx={{ whiteSpace: "nowrap" }}>{d.price}</TableCell>
          <TableCell sx={{ whiteSpace: "nowrap" }}>{renderPriceWithDiff(d.prevDayPrice, d.price)}</TableCell>
          <TableCell sx={{ whiteSpace: "nowrap" }}>{renderPriceWithDiff(d.prevWeekPrice, d.price)}</TableCell>
          <TableCell sx={{ whiteSpace: "nowrap" }}>{renderPriceWithDiff(d.prevMonthPrice, d.price)}</TableCell>
        </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OneWeekLineChart;
