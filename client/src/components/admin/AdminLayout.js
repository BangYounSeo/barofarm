import React, { useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

const drawerWidth = 220;

const menuItems = [
  { label: "대시보드", path: "/admin" },
  { label: "사용자 관리", path: "/admin/users" },
  { label: "셀러 승인", path: "/admin/producers" },

  // 🔥 공지사항 관리자 메뉴 추가
  { label: "공지사항 관리", path: "/admin/notice" },

  { label: "배너 관리", path: "/admin/banner" },
  { label: "주문 / 결제 관리", path: "/admin/orders" },
  { label: "신고 관리", path: "/admin/report"},
  { label: "팝업 관리", path: "/admin/popup"},
  

];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const token = localStorage.getItem('token')

    if(!token){
      alert("로그인을 해주세요")
      window.location.href = '/member/login'
      return;
    }

    const role = localStorage.getItem("role")

    if(role!=='ROLE_ADMIN'){
      alert('관리자 권한이 필요합니다.')
      window.location.href = '/'
      return;
    }
  })

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#333" }}
      >
<Toolbar>
  <Typography
    variant="h6"
    sx={{ flexGrow: 1, cursor: "pointer" }}
    onClick={() => navigate("/admin")}
  >
    관리자페이지
  </Typography>

  <Typography
    variant="body2"
    sx={{ cursor: "pointer" }}
    onClick={() => navigate("/")}
  >
    <HomeIcon/>
  </Typography>
</Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            pt: 8,
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
