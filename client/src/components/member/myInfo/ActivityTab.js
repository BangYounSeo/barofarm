import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import React from 'react';

const ActivityTab = ({ navigate,COLORS,SHADOWS }) => {
  return (
    <Box>
      <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 2 }}>
        활동 내역
      </Typography>

      <Stack spacing={1.5}>
        <Paper
          sx={{
            p: 2,
            borderRadius: "14px",
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOWS.soft,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                내가 쓴 리뷰
              </Typography>
              <Typography
                sx={{ fontSize: "12px", color: COLORS.textSub, mt: 0.5 }}
              >
                구매한 상품에 대한 리뷰를 확인하고 수정할 수 있습니다.
              </Typography>
            </Box>
            <Button
              size="small"
              sx={{ textTransform: "none", fontSize: "13px" }}
              onClick={() => navigate('/user/mypage/reviews')}
            >
              바로가기
            </Button>
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: "14px",
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOWS.soft,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                찜한 상품
              </Typography>
              <Typography
                sx={{ fontSize: "12px", color: COLORS.textSub, mt: 0.5 }}
              >
                관심 상품을 모아보고, 다시 주문해보세요.
              </Typography>
            </Box>
            <Button
              size="small"
              sx={{ textTransform: "none", fontSize: "13px" }}
              onClick={() => navigate('/user/mypage/wishlist')}
            >
              바로가기
            </Button>
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: "14px",
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOWS.soft,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                내가 한 문의
              </Typography>
              <Typography
                sx={{ fontSize: "12px", color: COLORS.textSub, mt: 0.5 }}
              >
                커뮤니티 글 / Q&A / 1:1 문의 내역을 확인합니다.
              </Typography>
            </Box>
            <Button
              size="small"
              sx={{ textTransform: "none", fontSize: "13px" }}
              onClick={() => navigate('/user/mypage/qna')}
            >
              바로가기
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default ActivityTab;