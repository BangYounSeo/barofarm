// src/components/admin/AdminPopupFormModal.js
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Stack,
} from "@mui/material";

/**
 * props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onSave: (formData) => void  // create/update 둘 다 여기서 처리
 *  - initialData: 수정 시 기존 데이터, 생성 시 null
 */
export default function AdminPopupFormModal({
  open,
  onClose,
  onSave,
  initialData,
}) {
  const [form, setForm] = useState({
    id: null,
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    startAt: "",
    endAt: "",
    active: true,
    width: "",
    height: "",
  });

  // 수정 모드일 때 기존 데이터 채우기
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        title: initialData.title || "",
        content: initialData.content || "",
        imageUrl: initialData.imageUrl || "",
        linkUrl: initialData.linkUrl || "",
        // datetime-local 형식: "YYYY-MM-DDTHH:mm"
        startAt: initialData.startAt
          ? initialData.startAt.slice(0, 16)
          : "",
        endAt: initialData.endAt ? initialData.endAt.slice(0, 16) : "",
        active: initialData.active,
        width:
          initialData.width !== null && initialData.width !== undefined
            ? String(initialData.width)
            : "",
        height:
          initialData.height !== null && initialData.height !== undefined
            ? String(initialData.height)
            : "",
      });
    } else {
      // 🔥 새 작성 모드: initialData 쓰지 말고 초기값만
      setForm({
        id: null,
        title: "",
        content: "",
        imageUrl: "",
        linkUrl: "",
        startAt: "",
        endAt: "",
        active: true,
        width: "",
        height: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleActive = (e) => {
    setForm((prev) => ({
      ...prev,
      active: e.target.checked,
    }));
  };

  const handleSubmit = () => {
    // 📌 백엔드 LocalDateTime 포맷에 맞게 "YYYY-MM-DDTHH:mm:00" 으로 보냄
    const payload = {
      ...form,
      startAt: form.startAt ? `${form.startAt}:00` : null,
      endAt: form.endAt ? `${form.endAt}:00` : null,
      width: form.width ? Number(form.width) : null,
      height: form.height ? Number(form.height) : null,
    };

    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{form.id ? "팝업 수정" : "새 팝업 작성"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="제목"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="내용 (HTML 또는 텍스트)"
            name="content"
            value={form.content}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={4}
          />

          <TextField
            label="배경 이미지 URL"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            fullWidth
            placeholder="예: https://... 또는 /images/..."
          />

          <TextField
            label="클릭 시 이동할 링크(URL)"
            name="linkUrl"
            value={form.linkUrl}
            onChange={handleChange}
            fullWidth
            placeholder="예: https://www.barofarm.com/event/1"
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="가로(width, px)"
              name="width"
              value={form.width}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="세로(height, px)"
              name="height"
              value={form.height}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="노출 시작 시각"
              name="startAt"
              type="datetime-local"
              value={form.startAt}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="노출 종료 시각"
              name="endAt"
              type="datetime-local"
              value={form.endAt}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={form.active}
                onChange={handleToggleActive}
              />
            }
            label="사이트에 팝업 띄우기 (활성)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSubmit}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
