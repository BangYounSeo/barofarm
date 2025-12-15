import React, { useEffect, useState, useRef } from "react";
import { Paper, Typography, Box, Grid, Stack } from "@mui/material";

const BannerSlide = ({ retail, wholesale }) => {
  const retailKinds = retail ? Object.keys(retail) : [];
  const wholesaleKinds = wholesale ? Object.keys(wholesale) : [];

  const kinds = Array.from(new Set([...retailKinds, ...wholesaleKinds]));

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);

  const nextSlide = () => {
    if(kinds.length <=1) return;

    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % kinds.length);
      setFade(true);
    }, 350);
  };

  const resetTimer = () => {
    if(kinds.length <= 1) return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 3500);
  };

  useEffect(() => {
    if (kinds.length === 0) return;
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [kinds.length]);

  if (kinds.length === 0) return null;

  const safeIndex = index % kinds.length;
  const currentKind = kinds[safeIndex];

  const retailList = retail?.[currentKind] || [];
  const wholesaleList = wholesale?.[currentKind] || [];

  const itemName =
    retailList[0]?.itemName || wholesaleList[0]?.itemName || "";
  const regday =
    retailList[0]?.regday || wholesaleList[0]?.regday || "";

  const retailUnit = retailList[0]?.unit || "";
  const wholesaleUnit = wholesaleList[0]?.unit || "";

  const goToSlide = (i) => {
    if(kinds.length <= 1) return;
    
    setFade(false);
    setTimeout(() => {
      setIndex(i);
      setFade(true);
      resetTimer();
    }, 150);
  };

  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        background: "#fff8f0",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          opacity: fade ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        {/* 🔥 제목 — 날짜 포함 */}
        <Typography sx={{ fontSize: "20px", fontWeight: 700, mb: 2 }}>
          {itemName} / {currentKind} ({regday})
        </Typography>

        <Grid container spacing={4}>
          {/* 🔹 소매 */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, mb: 1 }}>
              소매 {retailUnit && `(${retailUnit})`}
            </Typography>

            {retailList.length === 0 ? (
              <Typography sx={{ color: "#aaa" }}>데이터 없음</Typography>
            ) : (
              retailList.map((d) => (
                <Typography key={d.id} sx={{ fontSize: "15px", mt: 0.5 }}>
                  등급: <b>{d.rank}</b> / 가격:{" "}
                  <b>{Number(d.dpr1).toLocaleString()}원</b>
                </Typography>
              ))
            )}
          </Grid>

          {/* 🔹 도매 */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, mb: 1 }}>
              도매 {wholesaleUnit && `(${wholesaleUnit})`}
            </Typography>

            {wholesaleList.length === 0 ? (
              <Typography sx={{ color: "#aaa" }}>데이터 없음</Typography>
            ) : (
              wholesaleList.map((d) => (
                <Typography key={d.id} sx={{ fontSize: "15px", mt: 0.5 }}>
                  등급: <b>{d.rank}</b> / 가격:{" "}
                  <b>{Number(d.dpr1).toLocaleString()}원</b>
                </Typography>
              ))
            )}
          </Grid>
        </Grid>
      </Box>

      {/* 🔥 Dot Indicator */}
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
        {kinds.map((_, i) => (
          <Box
            key={i}
            onClick={() => goToSlide(i)}
            sx={{
              width: i === safeIndex ? 13 : 10,
              height: i === safeIndex ? 13 : 10,
              borderRadius: "50%",
              backgroundColor: i === safeIndex ? "#ff7043" : "#ccc",
              cursor: "pointer",
              transition: "0.2s",
            }}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default BannerSlide;
