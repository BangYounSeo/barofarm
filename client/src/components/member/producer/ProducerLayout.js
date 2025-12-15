// src/components/producer/ProducerLayout.jsx
import React, { useEffect, useLayoutEffect } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import ProducerSidebar from "./ProducerSidebar";

const ProducerLayout = () => {
  // Layout.jsx에서 넘겨주는 COLORS, SHADOWS가 있으면 받아서 사용
  const { COLORS, SHADOWS } = useOutletContext() || {};

  useLayoutEffect(() => {
    const token = localStorage.getItem("token");

    if(!token) {
      alert("로그인을 해주세요.")
      window.location.href = '/member/login'
      return;
    }

    const role = localStorage.getItem("role")

    if(role!=='ROLE_PRODUCER'){
      alert('판매자 등록이 필요합니다.')
      window.location.href = '/producer/join'
      return;
    }
  })

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px - 80px)", // 헤더/푸터 높이 뺀 영역 정도로 가정
        bgcolor: "#fafafa",
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          display: "flex",
          gap: 3,
          pt: 4,
          pb: 6,
          px: 2,
        }}
      >
        {/* 왼쪽 사이드바 */}
        <ProducerSidebar COLORS={COLORS} SHADOWS={SHADOWS} />

        {/* 오른쪽 컨텐츠 영역 */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: SHADOWS?.card || "0 2px 8px rgba(0,0,0,0.06)",
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default ProducerLayout;
