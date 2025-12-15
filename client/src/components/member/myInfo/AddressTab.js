// src/components/member/AddressTab.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DaumPostcode from "react-daum-postcode";
import {
  getmyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  // deleteAddress  ← 삭제 구현 예정 시 사용
} from "../../../service/MemberService";

export default function AddressTab() {
  const { COLORS, SHADOWS } = useOutletContext();
  const [addresses, setAddresses] = useState([]);

  /* 추가 Dialog */
  const [open, setOpen] = useState(false);
  const [showPostcode, setShowPostcode] = useState(false);

  /* 수정 Dialog */
  const [editOpen, setEditOpen] = useState(false);

  /* 배송지 추가 form */
  const emptyForm = {
    alias: "",
    receiver: "",
    phone: "",
    postalCode: "",
    addr1: "",
    addr2: "",
    isDefault: false,
  };

  const [form, setForm] = useState(emptyForm);

  /* 배송지 수정 form */
  const [editForm, setEditForm] = useState({
    addressId: null,
    alias: "",
    receiver: "",
    phone: "",
    postalCode: "",
    addr1: "",
    addr2: "",
    isDefault: false,
  });

  /** 기본배송지가 1인 데이터 먼저 정렬 */
  const sortAddresses = (list) => {
    const defaultAddr = list.filter((a) => Number(a.isDefault) === 1);
    const others = list.filter((a) => Number(a.isDefault) !== 1);
    return [...defaultAddr, ...others];
  };

  /** 초기 로드 */
  useEffect(() => {
    (async () => {
      const res = await getmyAddresses();
      setAddresses(sortAddresses(res));
    })();
  }, []);

  /* 입력 핸들러 */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChangeEdit = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /** 배송지 추가 Dialog 열기 */
  const handleOpenDialog = () => {
    setForm(emptyForm);
    setShowPostcode(false);
    setOpen(true);
  };

  /** 수정 Dialog 열기 */
  const openEditDialog = (addr) => {
    setEditForm({
      ...addr,
      isDefault: addr.isDefault === 1,
    });
    setEditOpen(true);
  };

  /** 카카오 주소 검색 */
  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extra = "";
    if (data.addressType === "R") {
      if (data.bname) extra += data.bname;
      if (data.buildingName)
        extra += extra ? `, ${data.buildingName}` : data.buildingName;
      if (extra) fullAddress += ` (${extra})`;
    }

    setForm((prev) => ({
      ...prev,
      postalCode: data.zonecode,
      addr1: fullAddress,
    }));
    setShowPostcode(false);
  };

  /** 배송지 추가 */
  const handleSaveAddress = async () => {
    if (!form.receiver || !form.phone || !form.postalCode) {
      alert("필수 정보를 입력해 주세요.");
      return;
    }

    const payload = {
      ...form,
      isDefault: form.isDefault ? 1 : 0,
    };

    try {
      await addAddress(payload);
      const res = await getmyAddresses();
      setAddresses(sortAddresses(res));
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert("배송지 추가 중 오류가 발생했습니다.");
    }
  };

  /** 배송지 수정 */
  const handleEditSave = async () => {
    const payload = {
      ...editForm,
      isDefault: editForm.isDefault ? 1 : 0,
    };

    try {
      await updateAddress(payload);
      const res = await getmyAddresses();
      setAddresses(sortAddresses(res));
      setEditOpen(false);
    } catch (e) {
      console.error(e);
      alert("배송지 수정 중 오류 발생");
    }
  };

  /** 배송지 삭제 (디자인 연장 시 사용) */
  const handleDelete = (id) => {
    if (!window.confirm("배송지를 삭제하시겠습니까?")) return;

     deleteAddress(id)
     setAddresses(prev => prev.filter(addr => addr.addressId!==id));
  };

  return (
    <Box>
      {/* ▒▒▒ 배송지 추가 Dialog ▒▒▒ */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>배송지 추가</DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="배송지 별칭"
              name="alias"
              value={form.alias}
              onChange={handleChange}
              size="small"
              fullWidth
            />
            <TextField
              label="수령인"
              name="receiver"
              value={form.receiver}
              onChange={handleChange}
              size="small"
              fullWidth
            />
            <TextField
              label="연락처"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              size="small"
              fullWidth
            />

            {/* 우편번호 */}
            <Stack direction="row" spacing={1}>
              <TextField
                label="우편번호"
                name="postalCode"
                value={form.postalCode}
                InputProps={{ readOnly: true }}
                size="small"
                sx={{ width: 140 }}
              />

              <Button
                variant="contained"
                size="small"
                onClick={() => setShowPostcode(!showPostcode)}
                sx={{
                  textTransform: "none",
                  borderRadius: "999px",
                  bgcolor: COLORS.primaryStrong,
                  "&:hover": { bgcolor: COLORS.primary },
                }}
              >
                주소 검색
              </Button>
            </Stack>

            <TextField
              label="기본 주소"
              name="addr1"
              value={form.addr1}
              InputProps={{ readOnly: true }}
              size="small"
              fullWidth
            />

            <TextField
              label="상세 주소"
              name="addr2"
              value={form.addr2}
              onChange={handleChange}
              size="small"
              fullWidth
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isDefault: e.target.checked,
                    }))
                  }
                />
              }
              label="기본 배송지로 설정"
            />
          </Stack>

          {showPostcode && (
            <Box
              sx={{
                mt: 2,
                borderRadius: 1,
                overflow: "hidden",
                border: "1px solid #eee",
              }}
            >
              <DaumPostcode
                style={{ width: "100%", height: 400 }}
                onComplete={handleCompletePostcode}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="warning">
            취소
          </Button>

          <Button
            onClick={handleSaveAddress}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "999px",
              px: 3,
              bgcolor: COLORS.primaryStrong,
              "&:hover": { bgcolor: COLORS.primary },
            }}
          >
            추가하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* ▒▒▒ 배송지 수정 Dialog ▒▒▒ */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            배송지 수정
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#888" }}>
            선택한 배송지 정보를 수정할 수 있습니다.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="배송지 별칭"
              name="alias"
              value={editForm.alias}
              onChange={handleChangeEdit}
              size="small"
              fullWidth
            />

            <TextField
              label="수령인"
              name="receiver"
              value={editForm.receiver}
              onChange={handleChangeEdit}
              size="small"
              fullWidth
            />

            <TextField
              label="연락처"
              name="phone"
              value={editForm.phone}
              onChange={handleChangeEdit}
              size="small"
              fullWidth
            />

            <TextField
              label="우편번호"
              value={editForm.postalCode}
              InputProps={{ readOnly: true }}
              size="small"
              fullWidth
            />

            <TextField
              label="기본주소"
              value={editForm.addr1}
              InputProps={{ readOnly: true }}
              size="small"
              fullWidth
            />

            <TextField
              label="상세 주소"
              name="addr2"
              value={editForm.addr2}
              onChange={handleChangeEdit}
              size="small"
              fullWidth
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={editForm.isDefault}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isDefault: e.target.checked,
                    }))
                  }
                />
              }
              label="기본 배송지로 설정"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} color="warning">
            취소
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "999px",
              px: 3,
              bgcolor: COLORS.primaryStrong,
              "&:hover": { bgcolor: COLORS.primary },
            }}
          >
            수정하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* ▒▒▒ 상단 타이틀 + 추가 버튼 ▒▒▒ */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
          배송지 관리
        </Typography>

        <Button
          variant="contained"
          size="small"
          onClick={handleOpenDialog}
          sx={{
            textTransform: "none",
            borderRadius: "999px",
            bgcolor: COLORS.primaryStrong,
            "&:hover": { bgcolor: COLORS.primary },
          }}
        >
          + 배송지 추가
        </Button>
      </Stack>

      {/* ▒▒▒ 배송지 리스트 ▒▒▒ */}
      {addresses.length === 0 ? (
        <Paper
          sx={{
            py: 5,
            px: 3,
            textAlign: "center",
            borderRadius: "16px",
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOWS.soft,
          }}
        >
          등록된 배송지가 없습니다.
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {addresses.map((addr) => (
            <Paper
              key={addr.addressId}
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
                spacing={2}
              >
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <HomeIcon sx={{ color: COLORS.primaryStrong }} />

                    <Typography sx={{ fontWeight: 600 }}>
                      {addr.alias || "배송지"}
                    </Typography>

                    {addr.isDefault === 1 && (
                      <Chip
                        label="기본"
                        size="small"
                        sx={{ fontSize: 11 }}
                        color="primary"
                      />
                    )}
                  </Stack>

                  <Typography sx={{ fontSize: 13 }}>
                    {addr.receiver} · {addr.phone}
                  </Typography>

                  <Typography sx={{ fontSize: 13 }}>
                    {addr.postalCode} {addr.addr1} {addr.addr2}
                  </Typography>
                </Stack>

                <Stack direction="row">
                  <IconButton size="small" onClick={() => openEditDialog(addr)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton size="small" onClick={() => handleDelete(addr.addressId)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider sx={{ mt: 1 }} />
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
