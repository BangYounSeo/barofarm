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
  Bar,
  BarChart,
  LabelList,
} from "recharts";

// 👉 일별 API (itemName 기반)
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

export default function Expected_MarketPriceGraph({
  itemName,
  regday,
  clsCode,
  onDataLoaded,
  onDailyCalculated,
  productClsName,
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

          {
            label: '가격비교',
            dailyPrice: Math.round(toNum(json.d0)),
            marketPrice: Math.round(toNum(json.d0 * 1.3)),
          },
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
      } catch (e) {
        console.error(e);
        setError("그래프 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemName, regday, clsCode, onDataLoaded, onDailyCalculated]);

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
    <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Typography variant="h6">
            대형마트 예상 판매가
          </Typography>

          <Typography variant="body2" sx={{ color: "#ccc" }}>
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
      </Typography>

      <Box sx={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={data}
            layout="vertical"
            barCategoryGap={20}
          >
            {/* 🔥 고급스러운 그라데이션 정의 */}
            <defs>
              <linearGradient id="gradValue" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#A18AFF" stopOpacity={1} />
                <stop offset="100%" stopColor="#6E56CF" stopOpacity={1} />
              </linearGradient>

              <linearGradient id="gradMarket" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4F7BFF" stopOpacity={1} />
                <stop offset="100%" stopColor="#1C39BB" stopOpacity={1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis type="number" domain={[0, (dataMax) => Math.round((dataMax * 1.2) / 100) * 100]} />
            <YAxis type="category" dataKey="label" width={80} />


            <Tooltip />

            {/* ⭐ 당일 시세 */}
            <Bar
              dataKey="dailyPrice"
              name="당일 시세"
              fill="url(#gradValue)"
              barSize={36}
              radius={[0, 8, 8, 0]}
              animationDuration={1400}       // 애니메이션
              animationEasing="ease-out"
            >
              {/* 숫자 라벨 표시 */}
              <LabelList
                dataKey="dailyPrice"
                position="right"
                formatter={(v) => v.toLocaleString()}
                fill="#333"
                style={{ fontWeight: 600 }}
              />
            </Bar>

            {/* ⭐ 시장 판매가(예상) */}
            <Bar
              dataKey="marketPrice"
              name="예상 판매가격"
              fill="url(#gradMarket)"
              barSize={36}
              radius={[0, 8, 8, 0]}
              animationDuration={1600}
              animationEasing="ease-out"
            >
              <LabelList
                dataKey="marketPrice"
                position="right"
                formatter={(v) => v.toLocaleString()}
                fill="#333"
                style={{ fontWeight: 600 }}
              />
            </Bar>

            <Legend verticalAlign="bottom" height={36} />
          </BarChart>
        </ResponsiveContainer>

      </Box>
    </Paper>
  );
}
