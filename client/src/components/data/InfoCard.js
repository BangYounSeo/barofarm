import React from "react";
import { Card, CardActionArea, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function InfoCard({ title, to, bg, img, color }) {
  return (
    <Card
      sx={{
        flex: 1,
        height: 160,
        borderRadius: 4,
        bgcolor: bg,
        boxShadow: 3,
        overflow: "hidden",
        transition: "0.25s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={to}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
          px: 3,
        }}
      >
        {/* 텍스트 */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: color }}
        >
          {title}
        </Typography>

        {/* 이미지 */}
        <Box
          component="img"
          src={img}
          alt=""
          sx={{
            width: 90,
            height: 90,
            objectFit: "contain",
            opacity: 0.9,
          }}
        />
      </CardActionArea>
    </Card>
  );
}
