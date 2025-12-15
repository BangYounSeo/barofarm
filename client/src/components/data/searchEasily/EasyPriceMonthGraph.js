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
  Bar,
  Legend,
} from "recharts";

const API_URL = "/api/easy-price/monthly";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function EasyPriceMonthGraph({
  itemName,
  regday,
  clsCode,
  onDataLoaded,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!itemName || !regday || !clsCode) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          productName: itemName,
          regday,
          clsCode,
        });

        const res = await fetch(`${API_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("백엔드 오류");

        const json = await res.json();
        // json.data = [{ yyyymm, max, min }, ...]

        const graphData = (json.data || []).map((item) => {
          const max = toNum(item.max);
          const min = toNum(item.min);
          const avg = (max + min) / 2;

          return {
            label: item.yyyymm,
            max,
            min,
            avg,
          };
        });

        setData(graphData);
        if (onDataLoaded) onDataLoaded(graphData);
      } catch (e) {
        console.error(e);
        setError("월별 그래프 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemName, regday, clsCode, onDataLoaded]);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
        <Typography>데이터 불러오는 중...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!data.length) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        월별 가격 추이 (최고가 / 최저가 / 평균)
      </Typography>

      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis domain={[
              (dataMin) => Math.round((dataMin - (dataMin * 0.001))/100)*100,
              (dataMax) => Math.round((dataMax + (dataMax * 0.001))/100)*100
              ]}
            />
            <Tooltip />

            <Bar dataKey="min" name="최저가" barSize={14} fill="#4CA" />
            <Bar dataKey="max" name="최고가" barSize={14} fill="#F44336"/>
            
            <Line
              type="monotone"
              dataKey="avg"
              strokeWidth={3}
              name="평균가"
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
    </Paper>
  );
}
