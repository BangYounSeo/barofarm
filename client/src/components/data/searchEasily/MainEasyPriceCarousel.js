// client/src/components/data/searchEasily/MainEasyPriceCarousel.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Slider from "react-slick";
import dayjs from "dayjs";

import EasyPriceDailyGraph from "./EasyPriceDailyGraph";
import { itemImages } from "./PriceSearchPageB2C";
import defaultImage from "../../../assets/items/defaultImage.png";

const ONE_API = "/api/easy-price/one/kind01";
const ITEM_LIST_API = "/api/easy-price/items/distinct/kind01";
const CLS_CODE = "01";          // 소매
const MAX_BACK_DAYS = 7;        // d0가 0/null이면 최대 7일 전까지 뒤로 탐색

const formatNumber = (v) =>
  v === null || v === undefined
    ? "-"
    : Number(v).toLocaleString("ko-KR");

function MainEasyPriceCard({ itemName }) {
  const [regday, setRegday] = useState(
    dayjs().subtract(1, "day").format("YYYY-MM-DD") // 기본: 어제
  );
  const [selected, setSelected] = useState(null);
  const [dailyCalc, setDailyCalc] = useState({ d0: null, d30: null });
  const [hasDailyLoaded, setHasDailyLoaded] = useState(false);
  const [backCount, setBackCount] = useState(0);
  const [yearAvg, setYearAvg] = useState(null);
  const [error, setError] = useState("");

  const imageSrc = itemImages[itemName] || defaultImage;

  const navigate = useNavigate();

  // 🔹 기준 row(/one) 조회
  useEffect(() => {
    if (!itemName || !regday) return;

    const loadSelected = async () => {
      try {
        setError("");
        const query = new URLSearchParams({ itemName, regday }).toString();
        const res = await fetch(`${ONE_API}?${query}`);
        if (!res.ok) throw new Error("기준 가격 조회 실패");
        const data = await res.json();
        setSelected(data);
      } catch (e) {
        console.error(e);
        setError("기준 가격 정보를 불러올 수 없습니다.");
      }
    };

    loadSelected();
  }, [itemName, regday]);

  // 🔹 d0 / d30 계산 결과 받기
  const handleDailyCalculated = (calc) => {
    setDailyCalc(calc || { d0: null, d30: null });
    setHasDailyLoaded(true);
  };

  // 🔹 d0 이 0 또는 null 이면 하루씩 어제로 이동 (최대 MAX_BACK_DAYS번)
  useEffect(() => {
    if (!hasDailyLoaded) return;

    const raw = dailyCalc?.d0;
    const num = raw != null ? Number(raw) : null;

    if (
      (raw == null || !Number.isFinite(num) || num === 0) &&
      backCount < MAX_BACK_DAYS
    ) {
      const prev = dayjs(regday).subtract(1, "day");
      setRegday(prev.format("YYYY-MM-DD"));
      setBackCount((c) => c + 1);
      setHasDailyLoaded(false); // 다음 fetch 결과를 기다리도록
    }
  }, [dailyCalc, hasDailyLoaded, backCount, regday]);

  const hasTodayPrice =
    dailyCalc?.d0 != null && Number(dailyCalc.d0) !== 0;

  // 🔹 전월/전년 동기 텍스트 렌더링 헬퍼
  const renderDiffText = (label, now, prev) => {
    const nowNum = Number(now);
    const prevNum = Number(prev);

    if (
      !Number.isFinite(nowNum) ||
      !Number.isFinite(prevNum) ||
      prevNum === 0
    ) {
      return (
        <Typography sx={{ fontSize: 13 }}>
          {label}: 데이터 없음
        </Typography>
      );
    }

    const diff = nowNum - prevNum;
    const percent = ((diff / prevNum) * 100).toFixed(1);
    const color = diff > 0 ? "red" : diff < 0 ? "blue" : "black";
    const arrow = diff > 0 ? "▲" : diff < 0 ? "▼" : "■";

    return (
      <Typography sx={{ fontSize: 14 }}>
        {label}:{" "}
        <b>{formatNumber(prevNum)}원</b>{" "}
        <span style={{ color, fontWeight: 700 }}>
          ({diff > 0 ? "+" : ""}
          {formatNumber(diff)}원 {arrow}
          {percent}%)
        </span>
      </Typography>
    );
  };

  return (
    <Box sx={{ px: 1 }}>
      {/* 바깥 핑크 배경 (1번 캡쳐 느낌) */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 4,
          p: { xs: 2, md: 3 },
        }}
      >
        {/* 안쪽 흰 카드: 이미지 + 텍스트 + 그래프 가로 정렬 */}
        <Box
          sx={{
            bgcolor: "#eee",
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            display: "flex",
            alignItems: "center",
            gap: { xs: 2, md: 3 },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* 왼쪽: 품목 이미지 + 현재가 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "#eee",
              borderRadius: 2,
              p: 2,
              minWidth: { xs: "100%", md: 260 },
            }}
          >
            <Box
              sx={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                bgcolor: "#eee",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src={imageSrc}
                alt={itemName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>

            <Box sx={{ textAlign: "left" }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                {selected?.itemName || itemName} {selected?.unit || ""}
              </Typography>

              <Typography
                sx={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#2142AB",
                  mt: 1,
                }}
              >
                {hasTodayPrice
                  ? `${formatNumber(dailyCalc.d0)}원`
                  : "최근 7일간 데이터 없음"}
              </Typography>
            </Box>
          </Box>

          {/* 가운데: 전월동기 / 전년동기 */}
          <Box
            sx={{
              flex: 1,
              textAlign: "left",
              px: { xs: 0, md: 1 },
            }}
          >
            {hasTodayPrice ? (
              <>
                {renderDiffText(
                    "전월동기", 
                    dailyCalc.d0, 
                    dailyCalc.d30)}
                {renderDiffText(
                    "전년동기", 
                    dailyCalc.d0, 
                    yearAvg)}
              </>
            ) : (
              <Typography sx={{ fontSize: 13 }}>
                최근 7일간 가격 데이터 없음
              </Typography>
            )}
              {/* 🔹 여기 날짜 추가 */}
            <Typography
                sx={{
                mt: 0.5,
                fontSize: 12,
                color: "#666",
                }}
            >
                기준일: {regday}

                {/* 필요하면 dayjs 형식 변경도 가능
                    기준일: {dayjs(regday).format("YYYY-MM-DD")}
                */}
            </Typography>
            
            {/* 🔹 기준일 아래 +더보기 링크 */}
            <Typography
            sx={{
                mt: 0.3,
                fontSize: 12,
                color: "#1976d2",       // 링크 느낌 나는 색
                cursor: "pointer",
                display: "inline-block",
            }}
            onClick={() => navigate("/data/maindata")}
            >
            + 더보기
            </Typography>

          </Box>

          {/* 오른쪽: 미니 그래프 */}
          <Box
            sx={{
              flex: 2,
              minWidth: { xs: "100%", md: 320 },
              height: { xs: 200, md: 130},
            }}
          >
            <EasyPriceDailyGraph
              itemName={itemName}
              regday={regday}
              clsCode={CLS_CODE}
              onDataLoaded={() => {}}
              onDailyCalculated={handleDailyCalculated}
              onBasePrice={setYearAvg}
              productClsName="소매"
              compact   // 🔹 방금 만든 compact 모드 사용
            />
          </Box>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 1, fontSize: 12 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default function MainEasyPriceCarousel() {
  const [randomItems, setRandomItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 DB 에서 distinct 품목명 가져와서 랜덤 2개 뽑기
  useEffect(() => {
    const loadRandomItems = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(ITEM_LIST_API);
        if (!res.ok) throw new Error("품목 목록 조회 실패");
        const list = await res.json();

        if (Array.isArray(list) && list.length > 0) {
          const shuffled = [...list].sort(() => Math.random() - 0.5);
          setRandomItems(shuffled.slice(0, 4)); // 딱 4개
        } else {
          setRandomItems([]);
        }
      } catch (e) {
        console.error(e);
        setError("오늘의 간편 시세를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadRandomItems();
  }, []);

  if (loading || randomItems.length === 0) return null;

  const sliderSettings = {
    dots: true,
    arrows: false,
    autoplay: true,
    infinite: true,
    speed: 600,
    autoplaySpeed: 8000,
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1450px",
        mx: "auto",
        mt: 3,
        mb: 6,
      }}
    >
      <Typography variant="h5" sx={{ mb: 0, fontWeight: 600, ml: 4 }}>
        오늘의 간편 시세
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      <Slider {...sliderSettings}>
        {randomItems.map((name) => (
          <MainEasyPriceCard key={name} itemName={name} />
        ))}
      </Slider>
    </Box>
  );
}
