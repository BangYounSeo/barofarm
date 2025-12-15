import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

export default function AdminProducerDetailModal({
  open,
  onClose,
  producer,
  onSave,
}) {
  // 🔥 Hook은 항상 실행되도록 컴포넌트 최상단에서 선언해야 함
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");

  // 🔥 producer가 바뀔 때마다 값 세팅
  useEffect(() => {
    if (producer) {
      setStatus(producer.status || "");
      setReason(producer.reason || "");
    }
  }, [producer]);

  if (!producer) return null; // 🔥 이제 여기 있어도 안전함

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>판매자 상세정보</DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          기본 정보
        </Typography>

        <Stack spacing={2}>
          <TextField label="농가명" value={producer.farmName} InputProps={{ readOnly: true }} />
          <TextField label="회원 아이디" value={producer.memberUserId} InputProps={{ readOnly: true }} />
          <TextField label="전화번호" value={producer.callCenter} InputProps={{ readOnly: true }} />
          <TextField label="주소" value={`${producer.addr1} ${producer.addr2}`} InputProps={{ readOnly: true }} />
          <TextField label="운영시간" value={`${producer.startCall} ~ ${producer.endCall}`} InputProps={{ readOnly: true }} />

          {/* 상태 변경 */}
          <Select size="small" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="PENDING">대기</MenuItem>
            <MenuItem value="APPROVED">승인</MenuItem>
            <MenuItem value="REJECTED">반려</MenuItem>
            <MenuItem value="ON_HOLD">보류</MenuItem>
          </Select>

          {/* 사유 입력 */}
          <TextField
            label="사유"
            multiline
            minRows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={() => onSave({ status, reason })}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
