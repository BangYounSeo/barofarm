// src/components/product/PaymentSuccess.js
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  CardMedia,
} from "@mui/material";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [orderDatas, setOrderDatas] = useState(null);
  const [userId, setUserId] = useState(null);
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(null);

  const paymentId = new URLSearchParams(location.search).get("paymentId");
  const type = new URLSearchParams(location.search).get("type");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("orderDatas"));
    setOrderDatas(data);

    if (data) {
      setUserId(data.userId);
      setItems(data.items);
      setTotalPrice(data.totalPrice);
    } else {
      console.error("orderDatas 없음!");
    }
  }, []);

  useLayoutEffect(() => {
    const token = localStorage.getItem("token");

    if(!token) {
      alert("로그인을 해주세요.")
      window.location.href = '/member/login'
      return;
    }
  
  })

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f6fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
        pt:5
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 4,
          boxShadow: 4,
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 7 }}>
          <Typography variant="h5" fontWeight="700" gutterBottom>
            결제가 완료되었습니다 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary">
            주문이 정상적으로 완료되었습니다.
            <br />
            아래 주문정보를 확인해주세요.
          </Typography>
        </CardContent>

        <Divider sx={{ my: 2 }} />

        {/* 상품 목록 */}
        <CardContent sx={{ pt: 1 }}>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            주문 상품
          </Typography>

          <List>
            {items.map((item, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <CardMedia
                    component="img"
                    image={item.productImage}
                    alt="logo"
                    sx={{ width: 50, height:50, objectFit: "cover" , borderRadius: 2,}}
                    />
                <ListItemText
                  primary={`${item.productName} / ${item.name}`}
                  secondary={`${item.quantity}개 - ${item.price?.toLocaleString()}원`}
                  sx={{pl:3}}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>

        <Divider sx={{ my: 2 }} />

        {/* 주문 정보 */}
       <CardContent>
  <Typography variant="h6" fontWeight={600} gutterBottom>
    주문 정보
  </Typography>

  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      width: "100%",
      mt: 1,

      // 🚨 전역 CSS로 덮어써지는 문제 해결
      "& *": {
        display: "block !important",
      },
    }}
  >
    <Box sx={{ width: "100%" }}>
      <Typography color="text.secondary" fontSize={14}>
        결제자
      </Typography>
      <Typography fontWeight={600}>{userId}</Typography>
    </Box>

    <Divider />

    <Box sx={{ width: "100%" }}>
      <Typography color="text.secondary" fontSize={14}>
        결제번호
      </Typography>
      <Typography fontWeight={600}>{paymentId}</Typography>
    </Box>

    <Divider />

    <Box sx={{ width: "100%" }}>
      <Typography color="text.secondary" fontSize={14}>
        상태
      </Typography>
      <Typography color="success.main" fontWeight={600}>
        결제완료
      </Typography>
    </Box>

    <Divider />

    <Box sx={{ width: "100%" }}>
      <Typography color="text.secondary" fontSize={14}>
        결제금액
      </Typography>
      <Typography fontWeight={600}>{totalPrice?.toLocaleString()} 원</Typography>
    </Box>


  </Box>
</CardContent>

        <Divider sx={{ my: 2 }} />

        {/* 버튼 영역 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            p: 2,
            pt: 0,
          }}
        >
          <Button
            variant="contained"
            fullWidth
            sx={{
                height: 48,
                borderRadius: 2,
                fontSize: "1rem",
                backgroundColor: "#111",
                transition: "0.2s",
                "&:hover": {
                backgroundColor: "#000",
                transform: "scale(1.02)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                }
            }}
            onClick={() => navigate("/user/mypage/orders")}
            >
            주문 상세보기
            </Button>

                    <Button
            variant="outlined"
            fullWidth
            sx={{
                height: 48,
                borderRadius: 2,
                fontSize: "1rem",
                borderColor: "#111",
                color: "#111",
                transition: "0.2s",
                "&:hover": {
                borderColor: "#000",
                backgroundColor: "rgba(0,0,0,0.04)",
                transform: "scale(1.02)"
                }
            }}
            onClick={() => navigate("/")}
            >
            홈으로 이동
            </Button>

        </Box>
      </Card>
    </Box>
  );
};

export default PaymentSuccess;
