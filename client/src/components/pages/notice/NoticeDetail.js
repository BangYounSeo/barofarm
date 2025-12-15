// src/components/pages/notice/NoticeDetail.js
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function NoticeDetail({ notice, loading, onClose }) {
  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!notice) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 0.5,
        mb: 2,
        px: 2.5,
        py: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 2,
        border: "1px solid",
        borderColor: "grey.200",
        position: "relative",
      }}
    >
      {/* 닫기 버튼 */}
      <IconButton
        size="small"
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {/* 메타 정보 */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 1.5, fontSize: 14 }}
        divider={<Divider orientation="vertical" flexItem />}
      >
        <Typography variant="body2" color="text.secondary">
          작성자: {notice.userId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          작성일: {notice.createdAt?.slice(0, 10)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          조회수: {notice.viewCount}
        </Typography>
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      {/* 내용 */}
      <Box sx={{ whiteSpace: "pre-wrap" }}>
        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
          {notice.content}
        </Typography>
      </Box>
    </Box>
  );
}
