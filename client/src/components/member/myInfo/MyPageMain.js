import React from "react";
import { Box, Paper, Stack, Typography, Chip, Button } from "@mui/material";
import { useOutletContext, useNavigate } from "react-router-dom";
import ActivityTab from "./ActivityTab";

export default function MyPageMain() {
  // MyPage에서 Outlet context로 내려준 값
  const { myInfo, COLORS, SHADOWS } = useOutletContext();
  const navigate = useNavigate();

  const { user, purchase, review, good, qna } = myInfo;
  const userType = user?.userType || "consumer"
  const userName = user?.name || user?.userId || "회원";
  const isProducer = userType === "PRODUCER" || userType === "SELLER";

  return (
    <Box>
      {/* 인사 카드 */}
      <Paper
        sx={{
          borderRadius: "20px",
          p: { xs: 2.5, md: 3 },
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          boxShadow: SHADOWS.card,
          border: `1px solid ${COLORS.border}`,
          background:
            "linear-gradient(135deg, rgba(255,159,86,0.12), rgba(110,197,135,0.08))",
        }}
      >
        <Stack direction="row" spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "18px", md: "20px" },
                fontWeight: 700,
                color: COLORS.textMain,
              }}
            >
              {userName}님, 안녕하세요 👋
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, alignItems: "center" }}
            >
              <Chip
                size="small"
                label={isProducer ? "생산자 회원" : "일반 소비자"}
                sx={{
                  background: "#fff",
                  fontSize: "12px",
                  fontWeight: 500,
                  borderRadius: "999px",
                }}
              />
              <Typography sx={{ fontSize: "12px", color: COLORS.textSub }}>
                안전한 직거래를 위해 항상 최신 정보를 확인해 주세요.
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={3}
          sx={{
            mt: { xs: 2, md: 0 },
            textAlign: { xs: "left", md: "right" },
          }}
        >
          {isProducer ? (
            <Button
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: "999px",
                background: COLORS.primaryStrong,
                "&:hover": { background: COLORS.primary },
              }}
              onClick={() => navigate("/producer")}
            >
              판매자 페이지로 이동
            </Button>
          ) : (
            <Button
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: "999px",
                background: COLORS.primaryStrong,
                "&:hover": { background: COLORS.primary },
              }}
              onClick={() => navigate("/producer/join")}
            >
              판매자 등록 하러 가기
            </Button>
          )}
        </Stack>
      </Paper>

      {/* 간단 요약 카드 (개수 보여주기) */}
      <Paper
        sx={{
          borderRadius: "16px",
          p: 2,
          mb: 3,
          boxShadow: SHADOWS.soft,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <Typography sx={{ fontWeight: 600, mb: 1.5 }}>
          내 활동 요약
        </Typography>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ fontSize: 13 }}
        >
          <SummaryItem
            label="총 주문"
            value={`${purchase}건`}
            onClick={() => navigate("/user/mypage/orders")}
          />
          <SummaryItem
            label="내 리뷰"
            value={`${review}개`}
            onClick={() => navigate("/user/mypage/reviews")}
          />
          <SummaryItem
            label="찜한 상품"
            value={`${good}개`}
            onClick={() => navigate("/user/mypage/wishlist")}
          />
          <SummaryItem
            label="문의 내역"
            value={`${qna}건`}
            onClick={() => navigate("/user/mypage/qna")}
          />
        </Stack>
      </Paper>

      {/* 상세로 들어가는 카드형 바로가기 (기존 ActivityTab 재활용) */}
      <ActivityTab
        navigate={navigate}
        COLORS={COLORS}
        SHADOWS={SHADOWS}
      />
    </Box>
  );
}

function SummaryItem({ label, value, onClick }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 1.5,
        borderRadius: "12px",
        border: "1px solid #eee",
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? { background: "#fafafa", borderColor: "#ddd" }
          : undefined,
      }}
      onClick={onClick}
    >
      <Typography sx={{ fontSize: 12, color: "#777" }}>{label}</Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 600, mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );
}
