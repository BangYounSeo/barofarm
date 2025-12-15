import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

function MonthlyDataTable({ monthlyData, chartType }) {
  const getColorIconAndRate = (current, compare) => {
    if (current == null || compare == null) return { color: "inherit", icon: "", rate: null };
    if (compare > current) return { color: "#FF4D4F", icon: "▲", rate: ((compare - current) / current * 100).toFixed(1) };
    if (compare < current) return { color: "#1890FF", icon: "▼", rate: ((compare - current) / current * 100).toFixed(1) };
    return { color: "inherit", icon: "", rate: 0 };
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 3 ,overflowX:"auto"}}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>월</TableCell>
            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>현재가격</TableCell>
            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>전년가격</TableCell>
            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>내년가격</TableCell>
            {chartType === "bar" ? (
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>연평균</TableCell>
            ) : (
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>평년</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {monthlyData.map((row, idx) => {
            const nextInfo = getColorIconAndRate(row.price, row.nextPrice);
            const prevInfo = getColorIconAndRate(row.price, row.prevPrice);
            const avgPrice = chartType === "bar" ? row.yearAvg : row.monthlyAvg;
            const avgInfo = getColorIconAndRate(row.price, avgPrice);

            return (
              <TableRow key={idx}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{row.month}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{row.price?.toLocaleString() ?? "-"}</TableCell>

                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  {row.nextPrice != null ? (
                    <Typography component="span" sx={{ color: nextInfo.color}}>
                      {row.nextPrice.toLocaleString()} {nextInfo.icon} ({nextInfo.rate}%)
                    </Typography>
                  ) : "-"}
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  {row.prevPrice != null ? (
                    <Typography component="span" sx={{ color: prevInfo.color}}>
                      {row.prevPrice.toLocaleString()} {prevInfo.icon} ({prevInfo.rate}%)
                    </Typography>
                  ) : "-"}
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  {avgPrice != null ? (
                    <Typography component="span" sx={{ color: avgInfo.color }}>
                      {avgPrice.toLocaleString()} {avgInfo.icon} ({avgInfo.rate}%)
                    </Typography>
                  ) : "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MonthlyDataTable;
