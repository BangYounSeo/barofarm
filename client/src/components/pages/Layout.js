// client/src/pages/Layout.js
import React, { useEffect, useState, useCallback } from "react";
import { Box, Button } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import dayjs from "dayjs";

import Header from "./Header";
import Footer from "./Footer";
import PopupModal from "../common/PopupModal";
import { fetchActivePopups } from "../../service/AdminService";

export default function Layout() {
  const { pathname } = useLocation();
  const hidePaths = [];
  const hide = hidePaths.some((path) => pathname.startsWith(path));

  const [popups, setPopups] = useState([]);

  const today = dayjs().format("YYYY-MM-DD");

  // 🔥 팝업 로드 함수 (useEffect, 초기화 버튼에서 같이 사용)
  const loadPopups = useCallback(async () => {
    if (hide) return;

    try {
      const res = await fetchActivePopups();
      if (res.data && res.data.length > 0) {
        const visible = res.data.filter(
          (p) => !localStorage.getItem(`hidePopup_${today}_${p.id}`)
        );
        setPopups(visible);
      } else {
        setPopups([]);
      }
    } catch (err) {
      console.error("팝업 로드 실패:", err);
    }
  }, [hide, today]);

  useEffect(() => {
    loadPopups();
  }, [loadPopups]);

  // 개별 팝업 닫기 (그냥 닫기)
  const handleCloseOne = (id) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  };

  // 🔥 이 팝업만 오늘 하루 안 보기
  const handleHideTodayOne = (id) => {
    localStorage.setItem(`hidePopup_${today}_${id}`, "true");
    setPopups((prev) => prev.filter((p) => p.id !== id));
  };

  // 🔥 오늘 숨긴 팝업 다시 보고 싶을 때: 오늘 날짜의 hidePopup_* 키 전부 삭제
  const resetTodayHiddenPopups = () => {
    const prefix = `hidePopup_${today}_`;
    Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => localStorage.removeItem(key));

    // 다시 불러오기
    loadPopups();
  };

  return (
    <>
      {/* 메인 레이아웃 */}
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!hide && <Header />}

        <Box sx={{ mt: !hide ? "140px" : 0, flex: 1 }}>
          <Outlet />
        </Box>

        {!hide && <Footer />}
      </Box>

      {/* 여러 팝업을 동시에, 살짝 이격해서 띄우기 */}
      {popups.map((popup, idx) => (
        <PopupModal
          key={popup.id}
          open={true}
          popup={popup}
          onClose={() => handleCloseOne(popup.id)}
          onHideToday={() => handleHideTodayOne(popup.id)}
          offsetX={4 + idx * 6}
          offsetY={4 + idx * 3}
          width={popup.width || 400}
          height={popup.height || 600}
        />
      ))}
    </>
  );
}
