import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import EasyPriceDailyGraph from "./EasyPriceDailyGraph";
import EasyPriceDailyTable from "./EasyPriceDailyTable";
import EasyPriceMonthGraph from "./EasyPriceMonthGraph";
import EasyPriceMonthTable from "./EasyPriceMonthTable";
import EasyPriceYearGraph from "./EasyPriceYearGraph";
import EasyPriceYearTable from "./EasyPriceYearTable";

export default function EasyGraphesAndTables({
  itemName,
  regday,
  clsCode,
  dailyData,
  monthData,
  yearData,
  setDailyData,
  setMonthData,
  setYearData,
  onDailyCalculated,
  onYearAvg,
  productClsName,
}) {
  const [selected, setSelected] = useState("daily");

  const handleChange = (e, value) => {
    if (value !== null) setSelected(value);
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* 탭 카드 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            가격 데이터 보기
          </Typography>

          <ToggleButtonGroup
            value={selected}
            exclusive
            onChange={handleChange}
            color="primary"
            sx={{
              mt: 1,
              "& .MuiToggleButton-root": {
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: "bold",
              },
            }}
          >
            <ToggleButton value="daily">일별</ToggleButton>
            <ToggleButton value="month">월별</ToggleButton>
            <ToggleButton value="year">연도별</ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      {/* 🔹 일별: 항상 렌더하지만, 선택된 탭이 아닐 땐 display: none */}
      <Box sx={{ display: selected === "daily" ? "block" : "none" }}>
        <EasyPriceDailyTable data={dailyData} />
        <EasyPriceDailyGraph
          itemName={itemName}
          regday={regday}
          clsCode={clsCode}
          onDataLoaded={setDailyData}
          onDailyCalculated={onDailyCalculated}
          productClsName={productClsName}
        />
      </Box>

      {/* 🔹 월별 */}
      <Box sx={{ display: selected === "month" ? "block" : "none" }}>
        <EasyPriceMonthTable data={monthData} title="월별 가격" />
        <EasyPriceMonthGraph
          itemName={itemName}
          regday={regday}
          clsCode={clsCode}
          onDataLoaded={setMonthData}
        />
      </Box>

      {/* 🔹 연도별 */}
      <Box sx={{ display: selected === "year" ? "block" : "none" }}>
        <EasyPriceYearTable data={yearData} title="년도별 가격" />
        <EasyPriceYearGraph
          itemName={itemName}
          regday={regday}
          clsCode={clsCode}
          onDataLoaded={setYearData}
          onYearAvg={onYearAvg}
        />
      </Box>
    </Box>
  );
}