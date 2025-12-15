import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";


export default function YearAvgLineChart({ yearAvg, commonYearAvg }) {
  
  // 두 데이터 병합
  const mergedData = yearAvg.map((d) => {
    const normal = commonYearAvg.find((c) => String(c.commonYear) === String(d.year));
    return {
      year: d.year,
      avg: Number(d.avg),
      commonYearAvg: normal ? Number(normal.commonYearAvg) : null,
    };
  });

  // Y축 값 계산 (null 제외, 정수 처리)
  const yValues = mergedData.flatMap(d =>
    [d.avg, d.commonYearAvg].filter(v => v != null && isFinite(v))
  );

  const yMin = yValues.length ? Math.floor(Math.max(0, Math.min(...yValues) * 0.95)) : 0;
  const yMax = yValues.length ? Math.ceil(Math.max(...yValues) * 1.05) : 100;

  return (
    <Card className="p-4 shadow-xl rounded-2xl">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          연도별 평균 / 평년 비교 그래프
        </Typography>

        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={mergedData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[yMin, yMax]} />
              <Tooltip
                contentStyle={{ borderRadius: 12, padding: 10 }}
                formatter={(value) => value.toLocaleString() + "원"}
                labelFormatter={(label) => `${label}년`}
              />
              <Legend />

              <Line
                type="monotone"
                dataKey="avg"
                name="연평균"
                stroke="#52C41A"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                dataKey="commonYearAvg"
                name="평년"
                stroke="#1677FF"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
