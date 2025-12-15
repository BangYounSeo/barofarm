import React from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography
} from "@mui/material";

export default function EasyPriceYearTable({ data, title }) {
  if (!data || data.length === 0) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>날짜</TableCell>
              <TableCell align="right">최대값</TableCell>
              <TableCell align="right">최소값</TableCell>
              <TableCell align="right">평균값</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.label}</TableCell>
                <TableCell align="right">{row.max.toLocaleString()}</TableCell>
                <TableCell align="right">{row.min.toLocaleString()}</TableCell>
                <TableCell align="right">{row.avg.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
