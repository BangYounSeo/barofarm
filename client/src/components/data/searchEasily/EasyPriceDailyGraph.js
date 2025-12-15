import React, { useEffect, useState } from "react";
import { Paper, Box, Typography } from "@mui/material";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Area,
} from "recharts";

const API_URL = "/api/easy-price/daily";

// 안전 숫자 파서
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toNullableNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// 🔹 커스텀 툴팁
function CustomTooltip({ active, payload, label, basePrice }) {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;
  const hasBase = basePrice != null && !isNaN(basePrice);

  return (
    <Paper sx={{ p: 1.2, borderRadius: 1.5 }}>
      {/* 1) n일 전 */}
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
        {label}
      </Typography>

      {/* 2) 일자별 가격 */}
      <Typography sx={{ fontSize: 12, mt: 0.5 }}>
        일자별 가격: {value != null ? value.toLocaleString() : "-"}원
      </Typography>

      {/* 3) 평균가 */}
      {hasBase && (
        <Typography sx={{ fontSize: 12, mt: 0.2 }}>
          평균가: {basePrice.toLocaleString()}원
        </Typography>
      )}
    </Paper>
  );
}



export default function EasyPriceDailyGraph({
  itemName,
  regday,
  clsCode,
  onDataLoaded,
  onDailyCalculated,
  productClsName,
  onGraphClick,
  onBasePrice,
  compact = false,
}) {
  const [data, setData] = useState([]);
  const [basePrice, setBasePrice] = useState(null); // 🔹 평년 기준가
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!itemName || !regday || !clsCode) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          productName: itemName, // 🔹 백엔드 @RequestParam 이름과 맞춤
          regday,
          clsCode,
        });

        const res = await fetch(`${API_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("백엔드 에러");

        // json = { regday, yyyy, d0, d10, d20, d30, d40, mx, mn, normalAvg? }
        const json = await res.json();

        const d0_raw = toNullableNum(json.d0);
        const d10 = toNum(json.d10);
        const d20 = toNum(json.d20);
        const d30_raw = toNullableNum(json.d30);
        const d30 = toNum(json.d30);
        const d40 = toNum(json.d40);
        const mx = toNum(json.mx);
        const mn = toNum(json.mn);

        // 카드 상단에 쓸 현재가/전월동기
        if (onDailyCalculated) {
          onDailyCalculated({ d0: d0_raw, d30: d30_raw });
        }

        // 🔹 그래프용 데이터 (d40 ~ d0 선 그래프)
        const graphData = [
          { label: "40일 전", value: d40, mx, mn },
          { label: "30일 전", value: d30, mx, mn },
          { label: "20일 전", value: d20, mx, mn },
          { label: "10일 전", value: d10, mx, mn },
          { label: "해당일", value: toNum(json.d0), mx, mn },
        ];

        setData(graphData);
        if (onDataLoaded) onDataLoaded(graphData);

        // 🔹 평년 기준가 계산
        // 1순위: 백엔드가 내려주는 normalAvg (yyyy="평년"의 (mx+mn)/2)
        let base = json.normalAvg != null ? toNum(json.normalAvg) : null;

        // 2순위: 임시 fallback - 현재 응답의 mx, mn 평균
        if (
          (base === null || !Number.isFinite(base)) &&
          Number.isFinite(mx) &&
          Number.isFinite(mn) &&
          mx > 0 &&
          mn > 0
        ) {
          base = (mx + mn) / 2;
        }

        setBasePrice(base);
        if(onBasePrice) onBasePrice(base);
      } catch (e) {
        console.error(e);
        setError("그래프 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemName, regday, clsCode]);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mt: 4 }}>
        <Typography>그래프 데이터를 불러오는 중...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!data.length) return null;

  return (
    <Paper 
      elevation={compact ? 0 : 3} 
      sx={{ 
        p: compact ? 0 : 2, 
        borderRadius: compact ? 0 : 3, 
        boxSizing: "border-box",
        width: "100%",
        bgcolor: compact ? "transparent" : "background.paper",
        boxShadow: compact ? "none" : undefined,
      }}
    >
      <div
        onClick={onGraphClick}
        style={{ cursor: onGraphClick ? "pointer" : "default" }}
      >

        {/* 🔹 compact 아닐 때만 상단 제목/설명 보여주기 */}
        {!compact && (
          <Box 
            sx={{ 
              mb: 2, 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center" 
            }}
          >
            <Typography variant="h6">
              가격 추이 그래프
            </Typography>

            <Typography variant="body2" sx={{ color: "#000" }}>
              해당일:{" "}
              <Box component="span" sx={{ color: "#462679", fontWeight: 700 }}>
                {regday}
              </Box>
              {" / "}
              제품명:{" "}
              <Box component="span" sx={{ color: "#462679", fontWeight: 700 }}>
                {itemName}
              </Box>
              {" / "}
              분류:{" "}
              <Box component="span" sx={{ color: "#462679", fontWeight: 700 }}>
                {productClsName}
              </Box>
            </Typography>
          </Box>
        )}

        {/* 🔹 그래프 영역: compact면 높이만 줄이기 */}
        <Box sx={{ width: "100%", height: compact ? 160 : 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>

  <defs>
    {/* 🔹 선 아래 그라데이션 */}
    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#978FF9" stopOpacity={0.45} />
      <stop offset="100%" stopColor="#978FF9" stopOpacity={0} />
    </linearGradient>
  </defs>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis domain={[
              (dataMin) => Math.round((dataMin - (dataMin * 0.001))/100)*100,
              (dataMax) => Math.round((dataMax + (dataMax * 0.001))/100)*100
              ]}
            />          

            <Tooltip content={<CustomTooltip basePrice={basePrice}/>} />

            {/* 🔹 평년 기준 수평선 */}
            {basePrice != null && (
              <ReferenceLine
                y={basePrice}
                stroke="green"
                strokeWidth={3}
                name="평균가격"
                label={{ value: "평균가", position: "insideTopRight",  color: '#F44336'}}
              />
            )}

  {/* 🔵 선 아래 그라데이션 영역 */}
  <Area
    type="monotone"
    dataKey="value"
    fill="url(#valueGradient)"
    stroke="none"
    legendType="none"
  />

            {/* 🔵 d0~d40 선만 남김 */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8977AD"
              strokeWidth={3}
              name="일자별 가격"
              dot
            />

            {/* ✔ 차트 아래 범례 추가 */}
            <Legend
              verticalAlign="bottom"
              align="center"
              height={36}
              wrapperStyle={{ paddingTop: 10 }}
            />
            
          </ComposedChart>
          </ResponsiveContainer>
        </Box> 
      </div>
    </Paper>
  );
}
