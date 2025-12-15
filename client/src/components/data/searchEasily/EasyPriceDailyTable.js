import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";

export default function EasyPriceDailyTable({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
<div>
        <Box 
          sx={{ 
            mb: 2, 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}
        >
      <Typography variant="h6" sx={{ mb: 2 }}>
        일자별 가격 표
      </Typography>

          <Typography variant="body2" sx={{ color: "#000" }}>
            출처:{" "}
            <Box component="span" sx={{ color: "#000", fontWeight: 700}}>
               "kamis.or.kr"
            </Box>
          </Typography>
  </Box>
</div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>날짜</TableCell>
              <TableCell align="right">가격</TableCell>
              <TableCell align="right">최고가</TableCell>
              <TableCell align="right">최저가</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.label}</TableCell>
                <TableCell align="right">
                  {row.value.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {row.mx.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {row.mn.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
