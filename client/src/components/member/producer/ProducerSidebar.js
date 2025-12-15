// src/components/producer/ProducerSidebar.jsx
import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "대시보드", icon: <DashboardIcon />, to: "/producer" },
  { label: "상품 관리", icon: <Inventory2Icon />, to: "/producer/products" },
  { label: "주문 / 배송", icon: <LocalShippingIcon />, to: "/producer/orders" },
  { label: "정산 관리", icon: <AccountBalanceWalletIcon />, to: "/producer/settlement" },
  { label: "판매자 정보", icon: <SettingsIcon />, to: "/producer/profile" },
];

const ProducerSidebar = ({ COLORS, SHADOWS }) => {
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        bgcolor: "#fff",
        borderRadius: 2,
        boxShadow: SHADOWS?.card || "0 2px 8px rgba(0,0,0,0.06)",
        p: 2,
        height: "fit-content",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 1, color: COLORS?.primary || "#FF9F56" }}
      >
        판매자센터
      </Typography>
      <Typography variant="body2" sx={{ color: "#777", mb: 1.5 }}>
        상품, 주문, 정산을 한 곳에서 관리해요.
      </Typography>
      <Divider sx={{ mb: 1.5 }} />

      <List component="nav">
        {menuItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              "&.active": {
                bgcolor: (COLORS?.primary || "#FF9F56") + "15",
                color: COLORS?.primary || "#FF9F56",
                "& .MuiListItemIcon-root": {
                  color: COLORS?.primary || "#FF9F56",
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "#999" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default ProducerSidebar;
