import { Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import React from 'react';

const SellerCenterTab = ({ isProducer, sales, navigate,COLORS,SHADOWS }) => {
  if (!isProducer) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>
          생산자(판매자) 회원만 이용 가능한 메뉴입니다.
        </Typography>
        <Typography sx={{ fontSize: "13px", color: COLORS.textSub, mb: 2 }}>
          판매자로 전환을 원하시면 고객센터로 문의해주세요.
        </Typography>
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: "999px",
            background: COLORS.primary,
            "&:hover": { background: COLORS.primaryStrong },
          }}
          onClick={() => navigate("/support")}
        >
          고객센터 문의하기
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        sx={{ mb: 2 }}
        spacing={1.5}
      >
        <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
          내 판매 관리
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            sx={{
              textTransform: "none",
              borderRadius: "999px",
              border: `1px solid ${COLORS.primary}`,
              color: COLORS.primaryStrong,
            }}
            onClick={() => navigate("/salesboard")}
          >
            판매글 목록 보기
          </Button>
          <Button
            size="small"
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "999px",
              background: COLORS.primary,
              "&:hover": { background: COLORS.primaryStrong },
            }}
            onClick={() => navigate("/sales/write")}
          >
            + 새 판매글 등록
          </Button>
        </Stack>
      </Stack>

      {sales.length === 0 ? (
        <Box sx={{ py: 4, textAlign: "center", color: COLORS.textSub }}>
          아직 등록된 판매글이 없습니다.
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {sales.map((s) => (
            <Paper
              key={s.id}
              sx={{
                p: 2,
                borderRadius: "14px",
                border: `1px solid ${COLORS.border}`,
                boxShadow: SHADOWS.soft,
                cursor: "pointer",
                transition: "0.18s",
                "&:hover": {
                  boxShadow: SHADOWS.card,
                  borderColor: COLORS.primary,
                },
              }}
              onClick={() => navigate(`/detail/${s.id}`)}
            >
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: COLORS.textMain,
                      mb: 0.5,
                    }}
                  >
                    {s.title}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ fontSize: "12px" }}>
                    <Typography color={COLORS.textSub}>
                      조회수 {s.views}회
                    </Typography>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ mx: 0.5, borderColor: COLORS.border }}
                    />
                    <Typography color={COLORS.textSub}>
                      주문 {s.orders}건
                    </Typography>
                  </Stack>
                </Box>

                <Chip
                  label={s.status}
                  size="small"
                  sx={{
                    alignSelf: "flex-start",
                    fontSize: "12px",
                    bgcolor:
                      s.status === "판매중"
                        ? COLORS.primarySoft
                        : "rgba(0,0,0,0.03)",
                  }}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default SellerCenterTab;