import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { changeInfo, changePwdApi, checkPasswordApi } from "../../../service/MemberService";

const AccountTab = () => {
  const { myInfo, COLORS, SHADOWS } = useOutletContext();

  const [member, setMember] = useState(myInfo?.user);

  const [pwdForm, setPwdForm] = useState({
    currentPwd: "",
    changePwd: "",
    changePwdCheck: "",
  });

  const [openPwdCheck, setOpenPwdCheck] = useState(false); // 비밀번호 확인 다이얼로그
  const [confirmPwd, setConfirmPwd] = useState("");        // 입력한 비밀번호
  const [confirmPwdError, setConfirmPwdError] = useState(""); // 에러 메시지

  const [openInfo, setOpenInfo] = useState(false);
  const [openPwd, setOpenPwd] = useState(false);

  const isSocial = member?.userId?.startsWith("kakao") || member?.userId?.endsWith("@gmail.com") || member?.userId?.endsWith("@naver.com")

  // 개인정보 변경용 상태
  const [editForm, setEditForm] = useState({
    name: myInfo?.user?.name || "",
    phone: myInfo?.user?.phone || "",
    email: myInfo?.user?.email || "",
  });

  // 에러 상태
  const [pwdError, setPwdError] = useState({
    currentPwd: "",
    changePwd: "",
    changePwdCheck: "",
    changePwdFinal:""
  });

  const [editError, setEditError] = useState({
    name: "",
    phone: "",
    email: "",
    changeInfo:""
  });

  const [ok, setOk] = useState({
    name: null,
    phone: null,
    email: null,
    currentPwd: null,
    changePwd: null,
    changePwdCheck: null,
    changeInfo:null,
    changePwdFinal:null
  });

  useEffect(() => {
    if(myInfo?.user){
      setMember(myInfo.user);
      setEditForm({
        name: myInfo?.user?.name || "",
        phone: myInfo?.user?.phone || "",
        email: myInfo?.user?.email || "",
      })
    }
  },[myInfo])

  // ✅ 개인정보 입력 변경
  const handleChangeInfo = (e) => {
    const { name, value } = e.target;

    // 휴대폰 번호는 숫자만 허용 + 길이 제한
    if (name === "phone") {
      const onlyNums = value.replace(/\D/g, "").slice(0, 11);

      setEditForm((prev) => ({
        ...prev,
        phone: onlyNums,
      }));

      if (!onlyNums) {
        setEditError((prev) => ({
          ...prev,
          phone: "휴대폰 번호를 입력해 주세요.",
        }));
        setOk((prev) => ({ ...prev, phone: false }));
      } else if (onlyNums.length === 10 || onlyNums.length === 11) {
        setEditError((prev) => ({ ...prev, phone: "" }));
        setOk((prev) => ({ ...prev, phone: true }));
      } else {
        setEditError((prev) => ({
          ...prev,
          phone: "휴대폰 번호를 정확히 입력해 주세요.",
        }));
        setOk((prev) => ({ ...prev, phone: false }));
      }

      return;
    }

    // 이름 / 이메일 공통 처리
    setEditForm((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      if (!value.trim()) {
        setEditError((prev) => ({
          ...prev,
          name: "이름 입력은 필수 입니다.",
        }));
        setOk((prev) => ({ ...prev, name: false }));
      } else {
        setEditError((prev) => ({ ...prev, name: "" }));
        setOk((prev) => ({ ...prev, name: true }));
      }
    }

    if (name === "email") {
      if (!value) {
        // 이메일은 선택 입력이라면 에러 비우고 ok를 null로 두는 것도 가능
        setEditError((prev) => ({ ...prev, email: "" }));
        setOk((prev) => ({ ...prev, email: null }));
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setEditError((prev) => ({
            ...prev,
            email: "이메일 형식이 올바르지 않습니다.",
          }));
          setOk((prev) => ({ ...prev, email: false }));
        } else {
          setEditError((prev) => ({ ...prev, email: "" }));
          setOk((prev) => ({ ...prev, email: true }));
        }
      }
    }
  };

  // ✅ 비밀번호 입력 변경
  const handleChangePwd = (e) => {
    const { name, value } = e.target;
    setPwdForm((prev) => ({ ...prev, [name]: value }));
    setPwdError((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ 개인정보 변경 버튼 눌렀을 때
  const handleSubmitInfo = async() => {
    let hasError = false;

    setEditError({
      name: "",
      phone: "",
      email: "",
      changeInfo: "",
    });

    if (!editForm.name.trim()) {
      setEditError((prev) => ({
        ...prev,
        name: "이름 입력은 필수 입니다.",
      }));
      hasError = true;
    }

    if (!editForm.phone) {
      setEditError((prev) => ({
        ...prev,
        phone: "전화번호 입력은 필수입니다.",
      }));
      hasError = true;
    }

    // 이메일이 있다면 형식 재확인 (안전장치)
    if (editForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        setEditError((prev) => ({
          ...prev,
          email: "이메일 형식이 올바르지 않습니다.",
        }));
        hasError = true;
      }
    }

    if (hasError) return;

    try{
      await changeInfo(editForm);
      // 실제로는 여기서 API로 서버에 업데이트 요청
      setMember((prev) => ({
        ...prev,
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
      }));
      setOpenInfo(false);
    }catch(e){
      console.error(e)
      setEditError(prev => ({...prev,changeInfo:"정보 수정에 실패했습니다."}))
    }
  };

  // ✅ 비밀번호 변경 버튼 눌렀을 때
  const handleSubmitPwd = async() => {
    const errors = {};
    if (!pwdForm.currentPwd)
      errors.currentPwd = "현재 비밀번호를 입력해 주세요.";
    if (!pwdForm.changePwd)
      errors.changePwd = "새 비밀번호를 입력해 주세요.";
    if (pwdForm.changePwd && pwdForm.changePwd.length < 8)
      errors.changePwd = "비밀번호는 8자 이상이어야 합니다.";
    if (pwdForm.changePwd !== pwdForm.changePwdCheck)
      errors.changePwdCheck = "새 비밀번호가 서로 일치하지 않습니다.";

    if (Object.keys(errors).length > 0) {
      setPwdError(errors);
      return;
    }

    try{
      await checkPasswordApi(pwdForm.currentPwd)
    }catch(e){
      const msg = e?.response?.data?.message
      setPwdError(prev => ({...prev,changePwdFinal:msg || "비밀번호 확인에 실패했습니다."}))
      return;
    }
    
    try{
      await changePwdApi(pwdForm.changePwd)

      setOpenPwd(false);
      setPwdForm({
        currentPwd: "",
        changePwd: "",
        changePwdCheck: "",
      });
    }catch(e) {
      const msg = e?.response?.data?.message;
      setPwdError(prev => ({
        ...prev,
        changePwdFinal: msg || "비밀번호 변경에 실패했습니다.",
      }));
    }
  };

  // 비밀번호 확인 입력 변경
const handleChangeConfirmPwd = (e) => {
  setConfirmPwd(e.target.value);
  setConfirmPwdError("");
};

// 비밀번호 확인 제출
const handleSubmitConfirmPwd = async () => {
  if (!confirmPwd) {
    setConfirmPwdError("비밀번호를 입력해 주세요.");
    return;
  }

  try{
    const res = await checkPasswordApi(confirmPwd);

    console.log("비밀번호 확인 요청:", confirmPwd);

    // 비밀번호가 맞다고 가정하고 진행
    setOpenPwdCheck(false);   // 비밀번호 확인 Dialog 닫고
    setConfirmPwd("");        // 입력값 초기화
    setConfirmPwdError("");
    setOpenInfo(true);        // 개인정보 수정 Dialog 열기
  }catch(e){
    setConfirmPwdError(e?.response?.data?.message || "비밀번호 확인에 실패했습니다.");
  }
};

  return (
    <Box>
      {/* 비밀번호 확인 Dialog */}
      <Dialog
        open={openPwdCheck}
        onClose={() => {
          setOpenPwdCheck(false);
          setConfirmPwd("");
          setConfirmPwdError("");
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            비밀번호 확인
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#888", mt: 0.5 }}>
            개인정보 수정을 위해 현재 비밀번호를 다시 한 번 입력해 주세요.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="현재 비밀번호"
            type="password"
            fullWidth
            size="small"
            value={confirmPwd}
            onChange={handleChangeConfirmPwd}
            error={!!confirmPwdError}
            helperText={confirmPwdError}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={() => {
              setOpenPwdCheck(false);
              setConfirmPwd("");
              setConfirmPwdError("");
            }}
            color="warning"
            sx={{ textTransform: "none" }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "999px",
              px: 3,
              backgroundColor: COLORS.primaryStrong,
              "&:hover": {
                backgroundColor: COLORS.primary,
              },
            }}
            onClick={handleSubmitConfirmPwd}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ 개인정보 수정 Dialog */}
      <Dialog
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            개인정보 수정
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#888", mt: 0.5 }}>
            변경된 내용은 다음 로그인부터도 반영됩니다.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="이름"
              name="name"
              size="small"
              fullWidth
              value={editForm.name}
              onChange={handleChangeInfo}
              error={!!editError.name}
              helperText={editError.name}
            />
            <TextField
              label="휴대폰 번호"
              name="phone"
              size="small"
              fullWidth
              placeholder="01012345678"
              value={editForm.phone}
              onChange={handleChangeInfo}
              error={!!editError.phone}
              helperText={editError.phone}
            />
            <TextField
              label="이메일"
              name="email"
              size="small"
              fullWidth
              type="email"
              value={editForm.email}
              onChange={handleChangeInfo}
              error={!!editError.email}
              helperText={editError.email}
            />
          </Stack>

          {editError.changeInfo && (
            <Typography
              sx={{ mt: 1.5, fontSize: 12, color: "error.main", textAlign: "right" }}
            >
              {editError.changeInfo}
            </Typography>
          )}

          <Typography
            sx={{ mt: 2, fontSize: 11, color: "#999", lineHeight: 1.6 }}
          >
            * 아이디는 변경할 수 없습니다.
            <br />* 배송지 정보는 &quot;배송/정기배송&quot; 메뉴에서 관리할 수
            있습니다.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={() => setOpenInfo(false)}
            color="warning"
            sx={{ textTransform: "none" }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "999px",
              px: 3,
              backgroundColor: COLORS.primaryStrong,
              "&:hover": {
                backgroundColor: COLORS.primary,
              },
            }}
            onClick={handleSubmitInfo}
          >
            변경하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ 비밀번호 변경 Dialog */}
      <Dialog
        open={openPwd}
        onClose={() => setOpenPwd(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            비밀번호 변경
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#888", mt: 0.5 }}>
            현재 비밀번호를 다시 입력한 뒤 새 비밀번호로 변경해 주세요.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="현재 비밀번호"
              name="currentPwd"
              size="small"
              type="password"
              fullWidth
              value={pwdForm.currentPwd}
              onChange={handleChangePwd}
              error={!!pwdError.currentPwd}
              helperText={pwdError.currentPwd}
            />
            <Divider sx={{ my: 0.5 }} />
            <TextField
              label="새 비밀번호"
              name="changePwd"
              size="small"
              type="password"
              fullWidth
              value={pwdForm.changePwd}
              onChange={handleChangePwd}
              error={!!pwdError.changePwd}
              helperText={
                pwdError.changePwd || "영문/숫자/특수문자 조합 8자 이상 권장"
              }
            />
            <TextField
              label="새 비밀번호 확인"
              name="changePwdCheck"
              size="small"
              type="password"
              fullWidth
              value={pwdForm.changePwdCheck}
              onChange={handleChangePwd}
              error={!!pwdError.changePwdCheck}
              helperText={pwdError.changePwdCheck}
            />
          </Stack>
          {pwdError.changePwdFinal && (
            <Typography
              sx={{
                mt: 1.5,
                fontSize: 12,
                color: "error.main",
                textAlign: "right",
              }}
            >
              {pwdError.changePwdFinal}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={() => setOpenPwd(false)}
            color="warning"
            sx={{ textTransform: "none" }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "999px",
              px: 3,
              backgroundColor: COLORS.primaryStrong,
              "&:hover": {
                backgroundColor: COLORS.primary,
              },
            }}
            onClick={handleSubmitPwd}
          >
            변경하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= 메인 내용 ================= */}
      <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 2 }}>
        계정 설정
      </Typography>

      <Paper
        sx={{
          p: 2,
          borderRadius: "14px",
          border: `1px solid ${COLORS.border}`,
          boxShadow: SHADOWS.soft,
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            mb: 1.5,
            color: COLORS.textMain,
          }}
        >
          기본 정보
        </Typography>

        <Stack spacing={1} sx={{ fontSize: "13px", color: COLORS.textMain }}>
          <Row label="아이디" value={member?.userId || "-"} COLORS={COLORS} />
          <Row label="이름" value={member?.name || "-"} COLORS={COLORS} />
          <Row label="휴대폰 번호" value={member?.phone || "-"} COLORS={COLORS} />
          <Row label="이메일" value={member?.email || "-"} COLORS={COLORS} />
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            sx={{
              textTransform: "none",
              borderRadius: "999px",
              px: 3,
              backgroundColor: COLORS.primaryStrong,
              "&:hover": {
                backgroundColor: COLORS.primary,
              },
            }}
            onClick={() =>{
              if(isSocial){
                setOpenInfo(true)
              }else{
                setOpenPwdCheck(true)
              }
            }}
          >
            회원 정보 수정
          </Button>
          {!isSocial &&
            <Button
              size="small"
              sx={{
                textTransform: "none",
                borderRadius: "999px",
                fontSize: "13px",
                color: COLORS.primaryStrong,
              }}
              onClick={() => setOpenPwd(true)}
            >
              비밀번호 변경
            </Button>
          }
        </Stack>
      </Paper>
    </Box>
  );
};

/* 공통 row 컴포넌트 */
function Row({ label, value, COLORS }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        fontSize: "13px",
        py: 0.5,
      }}
    >
      <Box sx={{ width: "90px", color: COLORS.textSub }}>{label}</Box>
      <Box sx={{ flex: 1 }}>{value}</Box>
    </Stack>
  );
}

export default AccountTab;
