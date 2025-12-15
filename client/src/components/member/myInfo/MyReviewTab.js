// src/components/member/MyReviewsTab.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Pagination,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { useOutletContext, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getmyReview } from "../../../service/MemberService";
import { deleteReviewApi } from "../../../service/ReviewService";

const MyReviewsTab = () => {
  const { myInfo, COLORS, SHADOWS } = useOutletContext();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);

  const [page, setPage] = useState(1); // MUI 페이지는 1부터 시작
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const loadReviews = async () => {
    const res = await getmyReview({
      page: page - 1,   // 백엔드는 0부터, MUI는 1부터
      size,
    })
    setReviews(res.content)
    setTotalPages(res.totalPages)
  }
  useEffect(() => {
    loadReviews();
  }, [page, size]);

  const handleDelete = async (numRev) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteReviewApi(numRev);
      alert("삭제 완료");
      loadReviews(); // 새로고침
    } catch (e) {
      alert("삭제 실패");
    }
  };

  return (
    <Box>
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>
        내가 쓴 리뷰
      </Typography>

      {reviews.length === 0 ? (
        <Paper
          sx={{
            py: 5,
            px: 3,
            textAlign: "center",
            borderRadius: "16px",
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOWS.soft,
            color: COLORS.textSub,
            fontSize: 14,
          }}
        >
          작성한 리뷰가 없습니다.
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {reviews.map((r) => (
            <Paper
              key={r.numRev}
              sx={{
                p: 2,
                borderRadius: "14px",
                border: `1px solid ${COLORS.border}`,
                boxShadow: SHADOWS.soft,
              }}
            >
              {/* 카드 전체를 좌/우로 나눔 */}
              <Stack direction="row" spacing={2}>
                {/* ===== 왼쪽 영역 : 이미지 + 리뷰 내용 ===== */}
                <Box sx={{ flex: 1 }}>
                  {/* 상품 번호 / 날짜 (원하면 여기 또는 위 카드에서) */}
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.textSub,
                      mb: 0.5,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/detail/${r.numBrd}`)}
                  >
                    {r.board.subject}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: COLORS.textSub,
                      mb: 1,
                    }}
                  >
                    {r.created
                      ? dayjs(r.created).format("YYYY-MM-DD HH:mm")
                      : ""}
                  </Typography>

                  {/* 리뷰 이미지들 (여러 장이면 가로로 배치) */}
                  {r.images && r.images.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      {r.images.map((img) => (
                        <Box
                          key={img.numRevImg} // 필드 이름 맞게 수정
                          component="img"
                          src={img.url}           // ➜ DTO 필드 이름에 맞게 변경
                          alt="review"
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 1.5,
                            objectFit: "cover",
                          }}
                        />
                      ))}
                    </Stack>
                  )}

                  {/* 리뷰 내용 */}
                  <Typography sx={{ fontSize: 13, whiteSpace: "pre-line" }}>
                    {r.content}
                  </Typography>
                </Box>

                {/* ===== 오른쪽 영역 : 별점 + 수정/삭제 버튼 ===== */}
                <Stack
                  spacing={1}
                  alignItems="flex-end"
                  justifyContent="space-between"
                  sx={{ minWidth: 90 }}
                >
                  {/* 오른쪽 위: 별점 */}
                  <Rating
                    value={r.grade || 0}
                    readOnly
                    precision={0.5}
                    size="small"
                  />

                  {/* 오른쪽 아래: 버튼들 */}
                  <Stack direction="row" spacing={1}>
                    <Button size="small" sx={{ fontSize: 12, minWidth: 0 }}
                      onClick={() => navigate(`/review/write/${r.numBrd}?edit=${r.numRev}`)}
                    >
                      수정
                    </Button>
                    <Button size="small" sx={{ fontSize: 12, minWidth: 0 }}
                      onClick={() => handleDelete(r.numRev)}
                    >
                      삭제
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          shape="rounded"
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default MyReviewsTab;
