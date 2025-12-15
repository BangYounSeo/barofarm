// src/components/common/PopupModal.js
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";

export default function PopupModal({
  open,
  onClose,
  onHideToday,
  popup,
  // 🔥 새로 추가: 위치/크기 커스터마이징
  offsetX = 4,   // theme.spacing 단위 (기본: 4 * 8px = 32px 정도)
  offsetY = 4,
  width = 400,
  height = 600,
}) {
  if (!popup) return null;

  const handleImageClick = () => {
    if (!popup.linkUrl) return;

    if (
      popup.linkUrl.startsWith("http://") ||
      popup.linkUrl.startsWith("https://")
    ) {
      window.open(popup.linkUrl, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = popup.linkUrl;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      hideBackdrop
      PaperProps={{
        sx: {
          width,
          height,
          overflow: "hidden",
        },
      }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
          justifyContent: "flex-start",
        },
        "& .MuiPaper-root": {
          mt: offsetY, // 🔥 팝업마다 위치 조절
          ml: offsetX,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          onClick={handleImageClick}
          sx={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            backgroundImage: popup.imageUrl
              ? `url(${popup.imageUrl})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            cursor: popup.linkUrl ? "pointer" : "default",
            px: 2,
            color: "#fff",
            position: "relative",
            "&::before": popup.imageUrl
              ? {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.35)",
                }
              : {},
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1, maxWidth: "90%" }}>
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                fontWeight: "bold",
                textShadow: "0 1px 3px rgba(0,0,0,0.7)",
              }}
            >
              {popup.title}
            </Typography>

            <Typography
              variant="body1"
              component="div"
              dangerouslySetInnerHTML={{ __html: popup.content }}
              sx={{
                textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                whiteSpace: "pre-line",
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onHideToday}>오늘 하루 보지 않기</Button>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
