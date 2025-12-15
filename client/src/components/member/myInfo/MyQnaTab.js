// src/components/member/MyQnaTab.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useOutletContext, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getmyQna } from "../../../service/MemberService";

const MyQnaTab = () => {
  const { myInfo, COLORS, SHADOWS } = useOutletContext();
  const navigate = useNavigate();

  const [qnaList,setQnaList] = useState([])

  useEffect(() => {
    (async() => {
      const res = await getmyQna();

      setQnaList(res);
    })()
  },[])

  const getStatusChip = (q) => {
    const answered = !!q.answer;
    return (
      <Chip
        label={answered ? "답변 완료" : "답변 대기"}
        size="small"
        sx={{
          fontSize: 11,
          bgcolor: answered ? "#E8F5E9" : "#FFF7CC",
        }}
      />
    );
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
          내가 한 문의
        </Typography>
      </Stack>

      {qnaList.length === 0 ? (
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
          남긴 문의가 없습니다.
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {qnaList.map((q) => (
            <Paper
              key={q.numQna}
              sx={{
                p: 2,
                borderRadius: "14px",
                border: `1px solid ${COLORS.border}`,
                boxShadow: SHADOWS.soft,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.textMain,
                      mb: 0.3,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/detail/${q.board.numBrd}`)}
                  >
                    {q.board.subject}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, color: COLORS.textSub, mb: 0.5 }}
                  >
                    {q.created
                      ? dayjs(q.created).format("YYYY-MM-DD HH:mm")
                      : ""}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13, whiteSpace: "pre-line" }}
                  >
                    {q.title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13,color:COLORS.textSub, whiteSpace: "pre-line",textWrap:'nowrap' }}
                  >
                    {q.content}
                  </Typography>
                </Box>
                {getStatusChip(q)}
              </Stack>

              {q.answer && (
                <Box
                  sx={{
                    mt: 1.2,
                    p: 1.2,
                    borderRadius: "10px",
                    bgcolor: "#fafafa",
                    border: `1px dashed ${COLORS.border}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      mb: 0.5,
                      color: COLORS.textMain,
                    }}
                  >
                    답변
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13, whiteSpace: "pre-line" }}
                  >
                    {q.answer}
                  </Typography>
                  {q.answerAt && (
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: COLORS.textSub,
                        mt: 0.5,
                      }}
                    >
                      답변일{" "}
                      {dayjs(q.answerAt).format("YYYY-MM-DD HH:mm")}
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default MyQnaTab;
