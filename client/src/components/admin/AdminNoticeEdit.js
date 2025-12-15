// src/components/admin/AdminNoticeEdit.js
import React, { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminNoticeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = async () => {
    try {
      const res = await fetch(`/api/notice/admin/${id}`);

      if (!res.ok) {
        const text = await res.text();
        console.error("공지 불러오기 실패:", res.status, text);
        alert("공지 불러오기 실패\n" + text);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setNotice(data);
      setLoading(false);
    } catch (err) {
      console.error("불러오기 실패:", err);
      alert("공지 불러오기 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const editNotice = async () => {
    try {
      const res = await fetch(`/api/notice/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notice),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error("수정 실패:", res.status, msg);
        alert("수정 실패\n" + msg);
        return;
      }

      alert("수정 완료");
      navigate("/admin/notice");
    } catch (err) {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!notice) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
          <Typography>공지 정보를 불러오지 못했습니다.</Typography>
          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={() => navigate("/admin/notice")}
          >
            목록으로
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          공지 수정
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            label="제목"
            variant="outlined"
            fullWidth
            value={notice.subject || ""}
            onChange={(e) =>
              setNotice({ ...notice, subject: e.target.value })
            }
          />

          <TextField
            label="내용"
            variant="outlined"
            fullWidth
            multiline
            minRows={8}
            value={notice.content || ""}
            onChange={(e) =>
              setNotice({ ...notice, content: e.target.value })
            }
          />

          <TextField
            label="작성자 (admin ID)"
            variant="outlined"
            fullWidth
            value={notice.userId || ""}
            onChange={(e) =>
              setNotice({ ...notice, userId: e.target.value })
            }
          />

          <Box sx={{ display: "flex", gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!notice.pin}
                  onChange={(e) =>
                    setNotice({ ...notice, pin: e.target.checked })
                  }
                  color="primary"
                />
              }
              label="상단 고정"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={!!notice.strong}
                  onChange={(e) =>
                    setNotice({ ...notice, strong: e.target.checked })
                  }
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
            <Button variant="contained" onClick={editNotice}>
              수정
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
