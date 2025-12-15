import React from "react";
import { Box, Card, CardContent, Grid, Typography, useTheme } from "@mui/material";
import { PieChart, Pie, Cell, Text, ResponsiveContainer } from "recharts";
import GaugeChart from "./GaugeChart";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";

const PriceSummaryCard = ({ title, value, diff, unit = ""}) => {
  let color = "text.primary";
  let TrendIcon = null;

 const result = (((diff-value)/value)*100).toFixed(1);

  const trend =diff-value > 0 ? "up" : diff-value < 0 ? "down" : "flat"

  if (trend === "up") {
    color = "error.main"; // 빨강
    TrendIcon = <ArrowUpwardIcon sx={{fontSize:40}}/>;
  } else if (trend === "down") {
    color = "info.main"; // 파랑
    TrendIcon = <ArrowDownwardIcon sx={{fontSize:40}}/>;
  } else if (trend === "flat") {
    color = "text.secondary"; // 회색
    TrendIcon = <RemoveIcon sx={{fontSize:40}}/>;
  }

  return (
    <Card sx={{ p: 2, textAlign: "center", height: "100%" ,width:"100%", flex: 1, display: "flex",flexDirection: "column",}}>
      <Typography variant="subtitle1" gutterBottom>{title}</Typography>
      <Typography variant="h4">{value}{unit}</Typography>
      {result !== undefined && (
        <Typography
          variant="h6"
          sx={{
            color,
            display: "flex",
            flexDirection: "column", // 세로로 정렬
            justifyContent: "center",
            alignItems: "center",
            mt: 1,
          }}
        >
         <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center", // 세로 중앙 정렬
            gap: 2, // 아이콘과 텍스트 간 간격
          }}
        >
          {/* 왼쪽 아이콘 */}
          <Box > {/* 아이콘 크게 */}
            {TrendIcon}
          </Box>

          {/* 오른쪽 텍스트 */}
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span>
              {result > 0 ? `+${diff - value}원` : `${diff - value}원`}
            </span>
            <span>
              {result > 0 ? `+${result}%` : `${result}%`}
            </span>
          </Box>
        </Box>
</Typography>
      )}
    </Card>
  );
};


const Result = ({latestDay,itemName,selectedRank,todayPrice ,prevPrice ,prevWeekPrice ,prevMonthPrice ,prevYearPrice,filteredYearAvg ,commonYearAvg ,changes ,regionData,maxMinRegion ,maxRegion ,minRegion,currentRegion ,oneWeekChart,common5Year}) => {


  const getTrendText = (data) => {
  // NaN 제거
  const validData = data.filter(item => !isNaN(item.price));

  if (validData.length < 2) {
    return "데이터가 충분하지 않아 추세를 판단할 수 없습니다.";
  }

  // x, y 배열
  const x = validData.map((_, i) => i);
  const y = validData.map(item => item.price);

  // 평균 계산
  const xMean = x.reduce((a,b) => a+b, 0)/x.length;
  const yMean = y.reduce((a,b) => a+b, 0)/y.length;

  // 선형 회귀 기울기 계산
  const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean)*(y[i] - yMean), 0);
  const denominator = x.reduce((sum, xi) => sum + (xi - xMean)**2, 0);
  const slope = numerator / denominator;

  const absSlope = Math.abs(slope);

  // 강/완만 기준값 (원하면 조정 가능)
  const threshold = 70;

  if (slope > 0) {
    return absSlope < threshold 
      ? "최근 10일 동안 완만한 상승세가 이어지고 있습니다." 
      : "최근 10일 동안 강한 상승세가 이어지고 있습니다.";
  } else if (slope < 0) {
    return absSlope < threshold 
      ? "최근 10일 동안 완만한 하락세가 이어지고 있습니다." 
      : "최근 10일 동안 강한 하락세가 이어지고 있습니다.";
  } else {
    return "최근 10일 동안 추세에 변함이 없습니다.";
  }
};

const getLongTermTrendText = (commonYearAvg ,filteredYearAvg) => {
  if (!commonYearAvg || !filteredYearAvg) {
    return "데이터가 충분하지 않아 장기 추세를 판단할 수 없습니다.";
  }

  // 퍼센트 차이
  const diffPercent = ((filteredYearAvg - commonYearAvg) / commonYearAvg) * 100;
  const absPercent = Math.abs(diffPercent);

  // 퍼센트 기준 완만/강한 설정 (예: 2% 이상이면 강한)
  const thresholdPercent = 5;

  if (diffPercent > 0) {
    return absPercent < thresholdPercent
      ? "장기적으로는 5년 평균 대비 완만한 상승 추세를 유지하고 있습니다."
      : "장기적으로는 5년 평균 대비 강한 상승 추세를 유지하고 있습니다.";
  } else if (diffPercent < 0) {
    return absPercent < thresholdPercent
      ? "장기적으로는 5년 평균 대비 완만한 하락 추세를 보이고 있습니다."
      : "장기적으로는 5년 평균 대비 강한 하락 추세를 보이고 있습니다.";
  } else {
    return "장기적으로는 5년 평균과 비슷하여 추세에 변함이 없습니다.";
  }
};

const theme = useTheme();
  const color = theme.palette.primary.main;
  return (
    <Box sx={{ display: "flex", pt: 5, gap: 2 , flexDirection: "column"}}>
      <Box >
        <Typography variant="h5" sx={{ fontWeight: 400 }} >
          <strong>{latestDay}</strong> 기준<br/>
          <span style={{ color: color }}>{itemName}</span> | <span style={{ color: color }}>{selectedRank}</span> | <span style={{ color: color }}>{currentRegion}</span>  |현재 가격은 <strong>{todayPrice}</strong>원
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: {xs: "column",sm:"row"}, pt:5, gap: 4 }}>
        {/* 올해 평균 대비 */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width:{xs:"100%",sm:"30%"}}}>
          <Typography>올해 평균 대비</Typography>
          <GaugeChart currentPrice={todayPrice} referencePrice={filteredYearAvg} />
        </Box>

        {/* 평년 대비 */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width:{xs:"100%",sm:"30%"}}}>
          <Typography>평년 대비</Typography>
          <GaugeChart currentPrice={todayPrice} referencePrice={commonYearAvg} />
        </Box>

        {/* 전년 동월 대비 */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width:{xs:"100%",sm:"30%"}}}>
          <Typography>전년 동월 대비</Typography>
          <GaugeChart currentPrice={todayPrice} referencePrice={prevYearPrice} />
        </Box>
      </Box>

       <Box sx={{ mb: 2,
    gap: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch", // 중요: 모든 자식 stretch
    "& > *": {
      display: "flex",
      flexDirection: "row",
    },}}>
        
      {/* 1. 오늘 가격 + 전일 대비 */}
      <Box sx={{ mb: 2 ,gap:4 ,display: "flex", flexDirection: {xs: "column",sm:"row"},alignItems: "stretch",width: {xs:"90%",sm:"100%"}, }}>
          <PriceSummaryCard title="전일 대비" value={prevPrice} diff={todayPrice} trend={prevPrice > 0 ? "up" : prevPrice < 0 ? "down" : "flat"} />
          <PriceSummaryCard title="전주 대비" value={prevWeekPrice} diff={todayPrice} trend={prevWeekPrice > 0 ? "up" : prevWeekPrice < 0 ? "down" : "flat"} />
          <PriceSummaryCard title="전월 대비" value={prevMonthPrice} diff={todayPrice} trend={prevMonthPrice > 0 ? "up" : prevMonthPrice < 0 ? "down" : "flat"} />

        <Card sx={{ p: 2, textAlign: "center" , flex: 1,display: "flex", flexDirection: "column",height: "100%",width:"100%"}}>
        <Typography variant="subtitle1">
          최근 10일{" "}
          <span style={{ color: "#FF4D4F" }}>급등</span>
          <span style={{ color: "#1890FF", marginLeft: 4 }}>급락</span>
        </Typography>
          {changes && changes.length > 0 ? (
          <Box sx={{ mt: 1 }}>
            {changes.map((item, index) => (
              <Typography key={index} variant="body2">
                {item.date}:{" "}
                <span
                  style={{
                    color: item.status.includes("급등")
                      ? "#FF4D4F" // 빨간색
                      : item.status.includes("급락")
                      ? "#1890FF" // 파란색
                      : "inherit",
                  }}
                >
                  {item.status}
                </span>
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ mt: 1 }}>
            최근 10일 급등/급락 없음
          </Typography>
        )}
          <Box sx={{ mt: "auto" }}>
            <Typography variant="body2" sx={{ mt: 3, opacity: 0.5 }}>
              * 기준 : ± 5%
            </Typography>
          </Box>
      </Card>
        <Card sx={{ p: 2, textAlign: "center" , flex: 1,display: "flex",flexDirection: "column", height: "100%",width:"100%"}}>
          <Typography variant="subtitle1">지역별 가격 차이</Typography>
          <Typography variant="body2">
            <strong>최고값</strong><br />
            {maxRegion?.region ?? "-"}:{" "}
            <span
              style={{
                color: maxRegion?.price - todayPrice >= 0 ? "#FF4D4F" : "#1890FF",
                fontWeight: "bold",
              }}
            >
              {maxRegion?.price ?? "-"}원
            </span>{" "}
            {maxRegion?.price ? (
              <span
                style={{
                  color: maxRegion.price - todayPrice >= 0 ? "#FF4D4F" : "#1890FF",
                  fontWeight: "bold",
                  marginLeft: 5,
                }}
              >
                {(((maxRegion.price - todayPrice) / todayPrice) * 100).toFixed(1)}%
                {maxRegion.price - todayPrice >= 0 ? "▲" : "▼"}
              </span>
            ) : (
              "-"
            )}
          </Typography>

          <Typography variant="body2">
            <strong>최저값</strong><br />
            {minRegion?.region ?? "-"}:{" "}
            <span
              style={{
                color: minRegion?.price - todayPrice >= 0 ? "#FF4D4F" : "#1890FF",
                fontWeight: "bold",
              }}
            >
              {minRegion?.price ?? "-"}원
            </span>{" "}
            {minRegion?.price ? (
              <span
                style={{
                  color: minRegion.price - todayPrice >= 0 ? "#FF4D4F" : "#1890FF",
                  fontWeight: "bold",
                  marginLeft: 5,
                }}
              >
                {(((minRegion.price - todayPrice) / todayPrice) * 100).toFixed(1)}%
                {minRegion.price - todayPrice >= 0 ? "▲" : "▼"}
              </span>
            ) : (
              "-"
            )}
          </Typography>
          <br/>
          <Typography variant="body2">
            현재 지역: {regionData.length === 2
              ? `${maxMinRegion.find(item => item.region === currentRegion)?.region ?? "-"} ${maxMinRegion.find(item => item.region === currentRegion)?.price ?? "-"}원`
              : `${maxMinRegion.find(item => item.region === "전체")?.region ?? "-"} ${maxMinRegion.find(item => item.region === "전체")?.price ?? "-"}원`}
          </Typography>
        </Card>
      </Box>
      
    </Box>
   <Box
  sx={{
    fontSize: 16,
    textAlign: "center", // 글자 가운데 정렬
    backgroundColor: "#cecdcdff", // 연한 회색 배경
    p: 3,
    mt:3,
    borderRadius: 2, // 모서리 둥글게
    width:{sm:"95%",xs:"85%"},
    mx: "auto", // 화면 가운데 정렬
  }}
>
  <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
    농산물 분석 요약
  </Typography>

  <Typography sx={{ mb: 1 }}>
    현재 가격은 1년 평균보다 약{" "}
    <span
      style={{
        color:
          filteredYearAvg &&
          ((todayPrice - filteredYearAvg) / filteredYearAvg) * 100 > 0
            ? "#FF4D4F"
            : "#1890FF",
        fontWeight: "bold",
      }}
    >
      {filteredYearAvg
        ? (((todayPrice - filteredYearAvg) / filteredYearAvg) * 100).toFixed(1)
        : "-"}%
    </span>{" "}
    {filteredYearAvg &&
    (((todayPrice - filteredYearAvg) / filteredYearAvg) * 100).toFixed(1) > 0
      ? "높고"
      : "낮고"}
    , {getTrendText(oneWeekChart)}
  </Typography>

  <Typography sx={{ mb: 1 }}>
    지역별 편차는 {maxRegion?.region ?? "-"}과 {minRegion?.region ?? "-"} 간 격차가 약{" "}
    <span
      style={{
        color:
          maxRegion?.price &&
          minRegion?.price &&
          Math.round(
            ((maxRegion.price - minRegion.price) / minRegion.price) * 100
          ) < 10
            ? "#1890FF"
            : "#FF4D4F",
        fontWeight: "bold",
      }}
    >
      {maxRegion?.price && minRegion?.price
        ? Math.round(
            ((maxRegion.price - minRegion.price) / minRegion.price) * 100
          )
        : "-"}%
    </span>{" "}
    로{" "}
    {maxRegion?.price &&
    minRegion?.price &&
    Math.round(((maxRegion.price - minRegion.price) / minRegion.price) * 100) <
      10
      ? "낮게"
      : "크게"}{" "}
    나타납니다.
  </Typography>

  <Typography>
    {getLongTermTrendText(commonYearAvg, filteredYearAvg)}
  </Typography>
  <Box
  sx={{
    mt: 3,
    opacity: 0.5,
    fontSize: "0.875rem",
  }}
>
  <Box component="span" sx={{ display: { xs: "block", sm: "inline" } }}>
    데이터 기준일: {latestDay}
  </Box>
  <Box component="span" sx={{ display: { xs: "block", sm: "inline" }, ml: { xs: 0, sm: 1 } }}>
    데이터 출처: https://www.kamis.or.kr/
  </Box>
  <Box component="span" sx={{ display: { xs: "block", sm: "inline" }, ml: { xs: 0, sm: 1 } }}>
    분석 기준: 최근/10일 , 평년/5년
  </Box>
</Box>
</Box>

    </Box>
  );
};

export default Result;
