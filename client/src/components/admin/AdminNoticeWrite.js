// src/components/admin/AdminNoticeWrite.js
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AdminNoticeWrite() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("관리자"); // 나중엔 로그인한 관리자 ID로 대체
  const [pin, setPin] = useState(false);
  const [strong, setStrong] = useState(false);

  const saveNotice = async () => {
    if (!subject.trim()) return alert("제목을 입력해주세요");
    if (!content.trim()) return alert("내용을 입력해주세요");
    if (!userId.trim()) return alert("작성자를 입력해주세요");

    try {
      const res = await fetch("/api/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content,
          userId,
          pin,
          strong,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error("등록 실패:", res.status, msg);
        alert("등록 실패\n" + msg);
        return;
      }

      alert("등록 완료");
      navigate("/admin/notice");
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          공지 등록
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            label="제목"
            variant="outlined"
            fullWidth
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <TextField
            label="내용"
            variant="outlined"
            fullWidth
            multiline
            minRows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <TextField
            label="작성자 (admin ID)"
            variant="outlined"
            fullWidth
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <Box sx={{ display: "flex", gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={pin}
                  onChange={(e) => setPin(e.target.checked)}
                  color="primary"
                />
              }
              label="상단 고정"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={strong}
                  onChange={(e) => setStrong(e.target.checked)}
                  color="secondary"
                />
              }
              label="강조"
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/notice")}
            >
              취소
            </Button>
            <Button variant="contained" onClick={saveNotice}>
              등록
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
