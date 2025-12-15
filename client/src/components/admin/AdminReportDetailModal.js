// src/components/admin/AdminReportDetailModal.js
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import dayjs from "dayjs";

const STATUS_LABEL = {
  READY: "대기",
  DELETE: "삭제",
  CANCEL: "신고취소",
  BLOCKED: "로그인 제한",
};

export default function AdminReportDetailModal({ open, onClose, report, onSave }) {
  const [status, setStatus] = useState("READY");
  const [statusReason, setStatusReason] = useState("");

  useEffect(() => {
    if (report) {
      setStatus(report.status || "READY");
      setStatusReason(report.statusReason || "");
    } else {
      setStatus("READY");
      setStatusReason("");
    }
  }, [report, open]);

  const handleSaveClick = () => {
    if (!status) {
      alert("상태를 선택해주세요.");
      return;
    }
    onSave({ status, statusReason });
  };

  if (!report) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>신고 상세</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2">
            <strong>신고 ID:</strong> {report.reportId}
          </Typography>
          <Typography variant="body2">
            <strong>신고한 회원:</strong> {report.userId}
          </Typography>
          <Typography variant="body2">
            <strong>신고 일시:</strong>{" "}
            {report.created ? dayjs(report.created).format("YYYY-MM-DD HH:mm") : "-"}
          </Typography>

          {report.reviewContent && (
            <TextField
              label="대상 댓글 내용"
              value={report.reviewContent}
              multiline
              minRows={2}
              InputProps={{ readOnly: true }}
            />
          )}

          <TextField
            label="신고 사유"
            value={report.reasonText || report.rawReason || ""}
            multiline
            minRows={2}
            InputProps={{ readOnly: true }}
          />

          <FormControl size="small">
            <InputLabel id="report-status-label">상태</InputLabel>
            <Select
              labelId="report-status-label"
              label="상태"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="READY">{STATUS_LABEL.READY}</MenuItem>
              <MenuItem value="DELETE">{STATUS_LABEL.DELETE}</MenuItem>
              <MenuItem value="CANCEL">{STATUS_LABEL.CANCEL}</MenuItem>
              <MenuItem value="BLOCKED">{STATUS_LABEL.BLOCKED}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="상태 변경 사유 (관리자 메모)"
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            multiline
            minRows={3}
            inputProps={{ maxLength: 500 }}
            helperText={`${(statusReason || "").length} / 500`}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSaveClick} variant="contained">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
