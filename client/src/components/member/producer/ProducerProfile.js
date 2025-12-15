// src/components/producer/ProducerProfile.jsx
import { getProducerProfile, updateProducerProfile } from "../../../service/ProducerService";
import { MemberContext } from "../../member/login/MemberContext";
import React, { useEffect, useState, useContext } from "react";
import {
  Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";
import Modal from "@mui/material/Modal";

// ⭐ 아이콘 추가
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

const ProducerProfile = () => {

  // 로그인 상태 컨텍스트
  const { loggedIn } = useContext(MemberContext);

  // 주소 검색 모달 열림/닫힘 상태
  const [openPostcode, setOpenPostcode] = useState(false);

  // 아이콘 컬러 설정
  const { COLORS } = useOutletContext() || {};
  const ORANGE = COLORS?.primary || "#FF9F56";

  // 폼 데이터 상태
  const [form, setForm] = useState({
    farmName: "",
    callCenter: "",
    postalCode: "",
    addr1: "",
    addr2: "",
    intro: "",
    settleEmail: "",
    startCall: "",
    endCall: "",
    courier: "",
    returnShippingFee: "",
    exchangeShippingFee: "",
    bank: "",
    accountNumber: "",
    accountHolder: "",
    bizNo: "",
    ceoName: ""
  });

  // 편집 모드 상태
  const [editing, setEditing] = useState(false);

  // 로그인 시 프로필 로드
  useEffect(() => {
    if (loggedIn) loadProfile();
  }, [loggedIn]);

  // 프로필 데이터 불러오기
  const loadProfile = async () => {
    try {
      const { data } = await getProducerProfile();
      setForm({
        farmName: data.farmName || "",
        callCenter: data.callCenter || "",
        postalCode: data.postalCode || "",
        addr1: data.addr1 || "",
        addr2: data.addr2 || "",
        intro: data.intro || "",
        settleEmail: data.settleEmail || "",
        startCall: data.startCall || "",
        endCall: data.endCall || "",
        courier: data.courier || "",
        returnShippingFee: data.returnShippingFee || "",
        exchangeShippingFee: data.exchangeShippingFee || "",
        bank: data.bank || "",
        accountNumber: data.accountNumber || "",
        accountHolder: data.accountHolder || "",
        bizNo: data.bizNo || "",
        ceoName: data.ceoName || ""
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 저장 버튼 핸들러
  const handleSave = async () => {
    try {
      await updateProducerProfile(form);
      alert("판매자 정보 저장 완료!");
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("저장 실패!");
    }
  };

  // 주소 검색 완료 핸들러
  const handleComplete = (data) => {
    let fullAddr = data.address;
    let extraAddr = "";
    if (data.addressType === "R") {
      if (data.bname !== "") extraAddr += data.bname;
      if (data.buildingName !== "") extraAddr += (extraAddr ? `, ${data.buildingName}` : data.buildingName);
      fullAddr += extraAddr !== "" ? ` (${extraAddr})` : "";
    }
    setForm(prev => ({ ...prev, postalCode: data.zonecode, addr1: fullAddr }));
    setOpenPostcode(false);
  };


  return (
    <Box>
      {/* 🏷 페이지 타이틀 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          판매자 정보 관리
        </Typography>
        <Typography variant="body2" sx={{ color: "#777", mt: 0.5 }}>
          고객에게 노출되는 농가 정보 및 정산 정보를 관리할 수 있어요.
        </Typography>
      </Box>

      {/* 📌 메인 카드 */}
      <Paper sx={{
        p: 4, borderRadius: 3,
        bgcolor: editing ? "#FFF8F0" : "#fff",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.04)",
      }}>
        <Grid container spacing={4}>

          {/* 🔸 1행 - 기본 정보 / 주소·사업자 정보 */}
          <Grid item xs={12} md={6}>
            {/* 1️⃣ 기본 정보 섹션 */}
            <Typography sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <StorefrontRoundedIcon sx={{ color: ORANGE }} />
              기본 정보
            </Typography>
            <Stack spacing={1.2}>
              <TextField fullWidth name="farmName" label="스토어명" value={form.farmName} onChange={handleChange}
                InputProps={{ readOnly: !editing }} size="small" />
              <TextField fullWidth name="ceoName" label="대표자명" value={form.ceoName} onChange={handleChange}
                InputProps={{ readOnly: !editing }} size="small" />
              <TextField fullWidth name="callCenter" label="연락처" value={form.callCenter} onChange={handleChange}
                InputProps={{ readOnly: !editing }} size="small" />
              <TextField fullWidth name="settleEmail" label="이메일" value={form.settleEmail} onChange={handleChange}
                InputProps={{ readOnly: !editing }} size="small" />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            {/* 2️⃣ 주소 / 사업자 정보 섹션 */}
            <Typography sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <BusinessCenterRoundedIcon sx={{ color: ORANGE }} />
              주소 / 사업자 정보
            </Typography>
            <Stack spacing={1.2}>
              {/* 우편번호 + 주소검색 버튼 */}
              <Stack direction="row" spacing={1}>
                <TextField size="small" sx={{ width: 120 }}
                  name="postalCode" label="우편번호"
                  value={form.postalCode} onChange={handleChange}
                  InputProps={{ readOnly: !editing }} />
                {editing &&
                  <Button variant="outlined" onClick={() => setOpenPostcode(true)}>주소검색</Button>
                }
              </Stack>
              <TextField fullWidth name="addr1" label="주소" size="small"
                value={form.addr1} onChange={handleChange}
                InputProps={{ readOnly: !editing }} />
              <TextField fullWidth name="addr2" label="상세주소" size="small"
                value={form.addr2} onChange={handleChange}
                InputProps={{ readOnly: !editing }} />
              <TextField fullWidth name="bizNo" label="사업자등록번호" size="small"
                value={form.bizNo} onChange={handleChange}
                InputProps={{ readOnly: !editing }} />
            </Stack>
          </Grid>


          {/* 🔸 2행 - 정산 계좌 정보 / 반품·교환 정책 */}
          <Grid item xs={12} md={6}>
            {/* 3️⃣ 정산 계좌 정보 섹션 */}
            <Typography sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <AccountBalanceRoundedIcon sx={{ color: ORANGE }} />
              정산 계좌 정보
            </Typography>
            <Stack spacing={1.2}>
              {/* 은행 선택 드롭다운 */}
              <TextField fullWidth select name="bank" label="은행" size="small"
                value={form.bank} onChange={handleChange} InputProps={{ readOnly: !editing }}>
                <MenuItem value="KB">국민은행</MenuItem>
                <MenuItem value="SH">신한은행</MenuItem>
                <MenuItem value="NH">농협은행</MenuItem>
                <MenuItem value="WR">우리은행</MenuItem>
                <MenuItem value="IBK">기업은행</MenuItem>
              </TextField>
              <TextField fullWidth name="accountNumber" label="계좌번호" size="small"
                value={form.accountNumber} onChange={handleChange}
                InputProps={{ readOnly: !editing }} />
              <TextField fullWidth name="accountHolder" label="예금주" size="small"
                value={form.accountHolder} onChange={handleChange}
                InputProps={{ readOnly: !editing }} />
            </Stack>
          </Grid>

          {/* ✨ 4️⃣ 반품·교환 정책 섹션 - 너비 축소 (md={4}로 변경) */}
          <Grid item xs={12} md={4}>
            <Typography sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <LocalShippingRoundedIcon sx={{ color: ORANGE }} />
              반품 / 교환
            </Typography>
            <Stack spacing={1.2}>
              {/* 택배사 입력 필드 */}
              <TextField fullWidth name="courier" label="택배사" size="small"
                value={form.courier} onChange={handleChange}
                InputProps={{ readOnly: !editing }} />
              {/* 반품·교환 배송비 입력 필드 */}
              <TextField fullWidth name="returnShippingFee" label="반품비"
                value={form.returnShippingFee} onChange={handleChange}
                InputProps={{ readOnly: !editing }} size="small" />
              <TextField fullWidth name="exchangeShippingFee" label="교환비"
                value={form.exchangeShippingFee} onChange={handleChange}
                InputProps={{ readOnly: !editing }} size="small" />
            </Stack>
          </Grid>


          {/* ✨ 5️⃣ 상담 가능 시간 / 소개 섹션 - 너비 확대 (md={8}로 변경) */}
          <Grid item xs={12} md={8}>
            <Typography sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeRoundedIcon sx={{ color: ORANGE }} />
              상담 가능 시간 / 소개
            </Typography>
            <Stack spacing={1.2}>
              {/* 상담 시작·종료 시간 입력 필드 */}
              <Stack direction="row" spacing={1}>
                <TextField sx={{ width: 140 }} size="small"
                  name="startCall" label="시작"
                  value={form.startCall} onChange={handleChange}
                  InputProps={{ readOnly: !editing }} />
                <TextField sx={{ width: 140 }} size="small"
                  name="endCall" label="종료"
                  value={form.endCall} onChange={handleChange}
                  InputProps={{ readOnly: !editing }} />
              </Stack>
            </Stack>
          </Grid>

        </Grid>


        {/* 🏷 주소 검색 모달 */}
        <Modal open={openPostcode} onClose={() => setOpenPostcode(false)}>
          <Box sx={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fff", p: 2, borderRadius: 2,
            width: { lg: 500, xs: '90%' }
          }}>
            <DaumPostcode onComplete={handleComplete} style={{ height: 500 }} />
          </Box>
        </Modal>

        {/* 📌 버튼 영역 */}
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 4 }}>
          {!editing ? (
            // 편집 모드가 아닐 때: 정보 수정 버튼
            <Button variant="contained" sx={{ bgcolor: ORANGE }} onClick={() => setEditing(true)}>정보 수정</Button>
          ) : (
            // 편집 모드일 때: 취소 + 저장 버튼
            <>
              <Button variant="text" onClick={() => setEditing(false)}>취소</Button>
              <Button variant="contained" sx={{ bgcolor: ORANGE }} onClick={handleSave}>저장</Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProducerProfile;