import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Drawer,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MemberContext } from "../login/MemberContext";
import { checkPasswordApi, deleteUser, getMyInfo } from "../../../service/MemberService";

const COLORS = {
  primary: "#FF9F56",
  primarySoft: "#FFE4C7",
  primaryStrong: "#FF7A3C",
  grayBg: "#F7F7F7",
  border: "#E5E5E5",
  textMain: "#333",
  textSub: "#777",
};

const SHADOWS = {
  card: "0 8px 20px rgba(0,0,0,0.06)",
  soft: "0 4px 12px rgba(0,0,0,0.04)",
};

const TAB_LABELS = {
  0: "", // 메인
  1: "구매내역",
  2: "배송지 관리",
  3: "내가 쓴 리뷰",
  4: "위시 리스트",
  5: "내가 한 문의",
  6: "개인정보 수정",
  7: "회원탈퇴",
};

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { member,logout } = useContext(MemberContext) || {};

  const [myInfo, setMyInfo] = useState({
    user: null,
    qna: 0,
    good: 0,
    review: 0,
    purchase: 0,
  });

  // 🔹 반응형 - 모바일 여부 체크
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // 🔹 Drawer 열림 상태
  const [drawerOpen, setDrawerOpen] = useState(false);

  useLayoutEffect(() => {
    const token = localStorage.getItem("token");

    if(!token) {
      alert("로그인을 해주세요.")
      window.location.href = '/member/login'
      return;
    }

  })
  useEffect(() => {
    (async () => {
      const data = await getMyInfo();
      setMyInfo(data);
    })();
  }, []);

  const currentPath = location.pathname;
  const getTabValue = () => {
    if (currentPath.startsWith("/user/mypage/orders")) return 1;
    if (currentPath.startsWith("/user/mypage/address")) return 2;
    if (currentPath.startsWith("/user/mypage/reviews")) return 3;
    if (currentPath.startsWith("/user/mypage/wishlist")) return 4;
    if (currentPath.startsWith("/user/mypage/qna")) return 5;
    if (currentPath.startsWith("/user/mypage/account")) return 6;
    if (currentPath === "/user/mypage") return 0;
    return 0;
  };

  const handleTabChange = (e, newVal) => {
    switch (newVal) {
      case 0:
        navigate("/user/mypage");
        break;
      case 1:
        navigate("/user/mypage/orders");
        break;
      case 2:
        navigate("/user/mypage/address");
        break;
      case 3:
        navigate("/user/mypage/reviews");
        break;
      case 4:
        navigate("/user/mypage/wishlist");
        break;
      case 5:
        navigate("/user/mypage/qna");
        break;
      case 6:
        navigate("/user/mypage/account");
        break;
      case 7:
        // 회원탈퇴 페이지 연결 시 여기
        setOpenPwdCheck(true);
        break;
      default:
        break;
    }

    // 모바일에서는 탭 선택하면 Drawer 닫기
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const tabValue = getTabValue();
  const sideTabValue = tabValue === 0 ? false : tabValue;
  const currentSubTitle = TAB_LABELS[sideTabValue];

  const [openPwdCheck, setOpenPwdCheck] = useState(false); // 비밀번호 확인 다이얼로그
  const [confirmPwd, setConfirmPwd] = useState("");        // 입력한 비밀번호
  const [confirmPwdError, setConfirmPwdError] = useState(""); // 에러 메시지

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
  
      // 비밀번호가 맞다고 가정하고 진행
      setOpenPwdCheck(false);   // 비밀번호 확인 Dialog 닫고
      setConfirmPwd("");        // 입력값 초기화
      setConfirmPwdError("");
      deleteUserInfo();
    }catch(e){
      setConfirmPwdError(e?.response?.data?.message || "비밀번호 확인에 실패했습니다.");
    }
  };

  const deleteUserInfo = async() => {
    try{
      const res = await deleteUser();
      alert(res)

      logout();
    }catch(e){
      alert("회원 탈퇴 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")
    }
  }

  // 🔹 탭 렌더링 부분을 함수로 분리해서
  //    데스크톱(왼쪽) + 모바일 Drawer에서 둘 다 재사용
  const renderTabs = (forDrawer = false) => (
    <Tabs
      orientation="vertical"
      value={sideTabValue}
      onChange={handleTabChange}
      variant="scrollable"
      sx={{
        width: forDrawer ? 260 : 220,
        borderRight: forDrawer ? "none" : `1px solid ${COLORS.border}`,
        px: 2,
        py: 3,
        "& .MuiTab-root": {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "14px",
          alignItems: "flex-start",
          minHeight: 36,
        },
        "& .Mui-selected": {
          color: COLORS.primaryStrong + " !important",
        },
        "& .MuiTabs-indicator": {
          backgroundColor: COLORS.primaryStrong,
          left: 0,
        },
      }}
    >
      <Box sx={{ height: 24 }} />
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
        쇼핑정보
      </Typography>
      <Tab label={TAB_LABELS[1]} value={1} />
      <Tab label={TAB_LABELS[2]} value={2} />

      <Box sx={{ height: 24 }} />
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
        활동정보
      </Typography>
      <Tab label={TAB_LABELS[3]} value={3} />
      <Tab label={TAB_LABELS[4]} value={4} />
      <Tab label={TAB_LABELS[5]} value={5} />

      <Box sx={{ height: 24 }} />
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
        개인정보
      </Typography>
      <Tab label={TAB_LABELS[6]} value={6} />
      <Tab label={TAB_LABELS[7]} value={7} />
    </Tabs>
  );

  return (
    <Box sx={{ width: "100%", pb: 8 }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto", pt: { xs: 2, md: 4 } }}>
        
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
              회원 탈퇴를 위해 현재 비밀번호를 다시 한 번 입력해 주세요.
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
        {/* 브레드크럼 */}
        <Box sx={{ mb: 2, fontSize: 14, color: COLORS.textSub,display:'flex', alignItems:'center',gap:1 }}>
          {/* 🔹 모바일에서만 메뉴 아이콘 표시 */}
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ mr:1, p:0.5}}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            component="span"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            홈
          </Typography>
          <Typography component="span"> &gt; </Typography>
          <Typography
            component="span"
            sx={{ cursor: "pointer", fontWeight: currentSubTitle ? 500 : 700 }}
            onClick={(e) => handleTabChange(e, 0)}
          >
            마이페이지
          </Typography>
          {currentSubTitle && (
            <>
              <Typography component="span"> &gt; </Typography>
              <Typography component="span" sx={{ fontWeight: 700 }}>
                {currentSubTitle}
              </Typography>
            </>
          )}
        </Box>

        {/* 왼쪽 메뉴 + 오른쪽 내용 */}
        <Paper
          sx={{
            borderRadius: "20px",
            boxShadow: SHADOWS.soft,
            border: `1px solid ${COLORS.border}`,
            display: "flex",
            minHeight: 400,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 🔹 데스크톱: 기존 왼쪽 세로 탭 유지 */}
          {!isMobile && renderTabs(false)}

          {/* 🔹 모바일 Drawer */}
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
            <Box sx={{ width: 260 }}>
              <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                  마이페이지 메뉴
                </Typography>
              </Box>
              {renderTabs(true)}
            </Box>
          </Drawer>

          {/* 오른쪽 내용 영역 */}
          <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, pt: isMobile ? 6 : 3 }}>
            <Outlet context={{ myInfo, COLORS, SHADOWS }} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
