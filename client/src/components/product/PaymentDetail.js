// src/components/product/PaymentDetail.js
import React, { useState, useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as PortOne from "@portone/browser-sdk/v2";
import { createOrder } from "../../service/PaymentService";
import { deleteAddressById, fetchUserAddresses, saveUserAddress, setDefaultAddress } from "../../service/AddressService";
import KakaoPostcode from "./KakaoPostcode";
import { v4 as uuidv4 } from "uuid";

import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  Stack,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const PRIMARY_COLOR = "#FFC19E";

const PaymentDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [receiver, setReceiver] = useState({
    name: "",
    phone: "",
    postalCode: "",
    addr1: "",
    addr2: "",
    alias: "",
  });

  
const orderDatas = JSON.parse(localStorage.getItem("orderDatas"));

// 2) location.state 값 읽기
const stateData = location.state;
// 최종적으로 사용할 데이터
let userId, items, totalPrice;

useLayoutEffect(() => {
  const token = localStorage.getItem("token");

  if(!token) {
    alert("로그인을 해주세요.")
    window.location.href = '/member/login'
    return;
  }
  
})

// 3) 우선순위 적용
if (orderDatas) {
  // 🔥 sessionStorage 값이 있으면 이 값 사용
  ({ userId, items, totalPrice } = orderDatas);
  // 그리고 sessionStorage에 저장
  localStorage.setItem(
    "orderDatas",
    JSON.stringify({ userId, items, totalPrice })
  );
} else if (stateData) {
  // 🔥 sessionStorage가 없고, stateData가 있으면 stateData 사용
  ({ userId, items, totalPrice } = stateData);

  // 그리고 sessionStorage에 저장
  localStorage.setItem(
    "orderDatas",
    JSON.stringify({ userId, items, totalPrice })
  );
} else {
  // 🔥 둘 다 없으면 예외 처리
  console.error("❌ orderDatas와 location.state 둘 다 없습니다.");
}

console.log("order",orderDatas)

  const loadAddresses = async () => {
    if (!items) return [];
    try {
      const res = await fetchUserAddresses(userId);
      let list = Array.isArray(res.data) ? res.data : res.data?.data || [];

    // deleted가 1인 주소 제거
        list = list.filter(addr => addr.deleted !== 1);
      setAddresses(list);
      return list;
    } catch (err) {
      console.error("주소 불러오기 실패", err);
      setAddresses([]);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      const list = await loadAddresses();
      if (list.length > 0) {
        const defaultAddress = list.find(addr => addr.isDefault === 1) || list[0];
        fillAddress(defaultAddress);
        setSelectedAddressId(defaultAddress.addressId);
      }
    };
    init();
  }, []);

  const fillAddress = (addr) => {
    setReceiver({
      alias: addr?.alias || "",
      name: addr?.receiver || "",
      phone: addr?.phone || "",
      postalCode: addr?.postalCode || "",
      addr1: addr?.addr1 || "",
      addr2: addr?.addr2 || "",
    });
  };

  const handleSelectAddress = (e) => {
    const id = e.target.value;
    setSelectedAddressId(id);
    const selected = addresses.find((addr) => addr.addressId == id);
    if (selected) fillAddress(selected);
  };

  const handleAddressComplete = ({ postalCode, addr1, addr2 }) => {
    setReceiver((prev) => ({
      ...prev,
      postalCode: postalCode || "",
      addr1: addr1 || "",
      addr2: addr2 || prev.addr2 || "",
    }));
  };

  const onChange = (e) => {
    setReceiver({
      ...receiver,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveAddress = async () => {
    if (!receiver.name || !receiver.addr1 || !receiver.alias) {
      return alert("이름, 기본주소, 주소 별칭은 필수입니다.");
    }

    const isDuplicate = addresses.some((addr) => addr.alias === receiver.alias);
    if (isDuplicate) {
      return alert("이미 등록된 주소 별칭 입니다.");
    }

    try {
       saveUserAddress(userId, {
        alias: receiver.alias,
        receiver: receiver.name,
        phone: receiver.phone,
        postalCode: receiver.postalCode,
        addr1: receiver.addr1,
        addr2: receiver.addr2,
      });

      alert("주소가 저장되었습니다.");
      const list = await loadAddresses();
      setAddresses(list);

      const savedAlias = receiver.alias;
      if (savedAlias) {
        const savedAddress = list.find((addr) => String(addr.alias) === String(savedAlias));
        if (savedAddress) {
          setSelectedAddressId(String(savedAddress.addressId));
          fillAddress(savedAddress);
        }
      }
    } catch (err) {
      console.error("주소 저장 오류:", err);
      alert("주소 저장 중 오류가 발생했습니다.");
    }
  };

  const handlePayment = async () => {
    if (!receiver.name || !receiver.phone ||!receiver.addr1 || !receiver.addr2) {
      return alert("배송 정보를 입력해주세요.");
    }

    const merchantUid = uuidv4();
console.log(merchantUid);
      
     // items 중에 cartId가 있는지 확인
  const hasCartId = items.some(item => item.cartId !== undefined && item.cartId !== null);

  // orderData 구성
  const orderData = {
    type: hasCartId ? "cart" : "direct",
    userId,
    receiverName: receiver.name,
    receiverPhone: receiver.phone,
    receiverPostalCode: receiver.postalCode,
    receiverAddr1: receiver.addr1,
    receiverAddr2: receiver.addr2,
    items,
    totalPrice,
    merchantUid
  };

    try {
  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const params = new URLSearchParams(orderData).toString();

  const response = await PortOne.requestPayment({
    storeId: "store-8112e713-971a-40c1-b6a5-774445f5bc39", 
    channelKey: "channel-key-8c47abca-64cd-4f30-9f43-fd443028fc81",
    paymentId: merchantUid,
    totalAmount: totalPrice,
    orderName: "바로팜 주문 결제",
    currency: "KRW",
    payMethod: "CARD",
    ...(isMobile && {
      // 프론트에서
redirectUrl :`http://192.168.0.18:3000/api/payment/successMobile?paymentId=${merchantUid}&type=${orderData.type}&orderDataJson=${encodeURIComponent(JSON.stringify(orderData))}`,
    }),
  });

  console.log("PortOne response:", response);

  // 1) 명시적 취소 케이스 (PG가 보내는 코드/pgCode)
  const code = response?.code ?? "";
  const pgCode = response?.pgCode ?? "";
  const msg = String(response?.message ?? "");

  if (
    code === "FAILURE_TYPE_PG" ||
    pgCode === "PAY_PROCESS_CANCELED" ||
    code === "USER_CANCEL" ||
    /취소|cancel/i.test(msg)
  ) {
    // 취소 처리
    window.alert("결제가 취소되었습니다.");
    return;
  }

  // 2) 실패 케이스 (명시적 실패 코드나 메시지)
  if (code && code !== "SUCCESS" && !/paid|success/i.test(msg)) {
    window.alert(`결제 실패: ${msg || "알 수 없는 오류"}`);
    return;
  }

  // 3) 결제 성공: paymentId가 있고 실패/취소 사인이 없으면 성공으로 간주
  if (response?.paymentId && !/취소|cancel|fail|error/i.test(msg)) {
    // 주문 생성
    window.location.href = `/api/payment/successMobile?paymentId=${merchantUid}&type=${orderData.type}&orderDataJson=${encodeURIComponent(JSON.stringify(orderData))}`;
    return;
  }

  // 4) 알 수 없는 경우 - 안전하게 처리
  window.alert(`결제 상태를 확인할 수 없습니다. 응답: ${msg || JSON.stringify(response)}`);
} catch (err) {
  console.error(err);
  window.alert("결제 요청 중 오류가 발생했습니다.");
}
  };

  if (!items) {
    return <Typography variant="h6">잘못된 접근입니다.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ mb: 4, color: PRIMARY_COLOR, fontWeight: "bold" }}>
        주문 / 결제
      </Typography>

      {/* 주문 상품 정보 */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4, transition: "0.3s", "&:hover": { transform: "translateY(-3px)" } }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            주문 상품
          </Typography>
          <Stack spacing={3}>
            {items.map((item) => (
              <Stack direction={isMobile ? "column" : "row"} spacing={2} key={item.numOptD} alignItems="center">
                <Box
                  component="img"
                  src={item.productImage}
                  alt="thumb"
                  sx={{ width: 100, height: 100, borderRadius: 2, objectFit: "cover" }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {item.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.optionName} / {item.quantity}개
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 0.5, color: "#e7651ad5" }}>
                    {(item.price * (item.quantity)).toLocaleString()}원
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

            {/* 배송지 선택 */}
        {Array.isArray(addresses) && addresses.length > 0 && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4, transition: "0.3s", "&:hover": { transform: "translateY(-3px)" } }}>
            <CardContent>
                <Box sx={{display:"flex" ,flexDirection:"row",mb:2,justifyContent:"space-between"}}>
            <Typography variant="h6">
                배송지 선택
            </Typography>
             <Stack direction="row" sx={{gap:2}}>
                <Button
                variant="outlined"
                color="primary"
                onClick={async () => {
                    if (!selectedAddressId) return alert("주소를 선택해주세요.");
                    try {
                    await setDefaultAddress(userId, selectedAddressId);
                    alert("기본 배송지로 설정되었습니다.");
                    await loadAddresses();
                    } catch (err) {
                    console.error(err);
                    alert("기본 배송지 설정 중 오류가 발생했습니다.");
                    }
                }}
                >
                기본 배송지 설정
                </Button>

                <Button
                variant="outlined"
                color="error"
                onClick={async () => {
                    if (!selectedAddressId) return alert("주소를 선택해주세요.");
                    if (!window.confirm("선택한 주소를 삭제하시겠습니까?")) return;

                    try {
                    await deleteAddressById(userId, selectedAddressId);
                    alert("주소가 삭제되었습니다.");
                    const list = await loadAddresses();
                    setSelectedAddressId(list[0]?.addressId || "");
                    if (list.length > 0) fillAddress(list[0]);
                    } catch (err) {
                    console.error(err);
                    alert("주소 삭제 중 오류가 발생했습니다.");
                    }
                }}
                >
                삭제
                </Button>
            </Stack>
            </Box>
            <FormControl fullWidth sx={{ "& .MuiInputLabel-root.Mui-focused": {
                    color: "#e7651ad5"},
                    "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#FFC19E",
                    } }
                  }}>
                <InputLabel>주소 선택</InputLabel>
                <Select value={selectedAddressId} onChange={handleSelectAddress} label="주소 선택">
                {addresses.map((addr) => (
                    <MenuItem key={addr.addressId} value={addr.addressId}>
                    {addr.alias} ({addr.addr1})
                    </MenuItem>
                ))}
                </Select>
            </FormControl>

           
            </CardContent>
        </Card>
        )}

      {/* 배송 정보 */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4, transition: "0.3s", "&:hover": { transform: "translateY(-3px)" } }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            배송 정보
          </Typography>
          <Stack spacing={2}>
            <TextField label="주소 별칭 (예: 집, 회사)" name="alias" value={receiver.alias} onChange={onChange} fullWidth sx={{
                    "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                        borderColor: "#FFC19E",   // 포커스 시 테두리 색
                    },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                    color: "#e7651ad5",          // 포커스 시 라벨 색
                    },
                }}/>
            <TextField label="받는 분" name="name" value={receiver.name} onChange={onChange} fullWidth 
            sx={{
                    "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                        borderColor: "#FFC19E",   // 포커스 시 테두리 색
                    },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                    color: "#e7651ad5",          // 포커스 시 라벨 색
                    },
                }}/>
            <TextField label="전화번호" name="phone" value={receiver.phone} onChange={onChange} fullWidth sx={{
                    "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                        borderColor: "#FFC19E",   // 포커스 시 테두리 색
                    },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                    color: "#e7651ad5",          // 포커스 시 라벨 색
                    },
                }} />
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="우편번호"
                name="postalCode"
                value={receiver.postalCode}
                InputProps={{ readOnly: true }}
                sx={{ flex: 1 ,
                    "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                        borderColor: "#FFC19E",   // 포커스 시 테두리 색
                    },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                    color: "#e7651ad5",          // 포커스 시 라벨 색
                    },}}
                />
              <KakaoPostcode onComplete={handleAddressComplete} />
            </Stack>
            <TextField label="기본주소" name="addr1" value={receiver.addr1} onChange={onChange} fullWidth sx={{
                    "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                        borderColor: "#FFC19E",   // 포커스 시 테두리 색
                    },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                    color: "#e7651ad5",          // 포커스 시 라벨 색
                    },
                }}
                />
            <TextField label="상세주소" name="addr2" value={receiver.addr2} onChange={onChange} fullWidth sx={{
                "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                    borderColor: "#FFC19E",   // 포커스 시 테두리 색
                },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                color: "#e7651ad5",          // 포커스 시 라벨 색
                },
            }}/>
            <Button
              variant="contained"
              onClick={handleSaveAddress}
              sx={{
                backgroundColor: PRIMARY_COLOR,
                "&:hover": { backgroundColor: "#ffb57d" },
                py: 1.5,
                fontWeight: "bold",
              }}
            >
              주소 저장
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 결제 정보 */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4, transition: "0.3s", "&:hover": { transform: "translateY(-3px)" } }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography>총 상품금액: {totalPrice.toLocaleString()}원</Typography>
            <Typography>배송비: 0원</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" sx={{ color: "#e7651ad5", fontWeight: "bold" }}>
              총 결제금액: {totalPrice.toLocaleString()}원
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        fullWidth
        onClick={handlePayment}
        sx={{
          backgroundColor: PRIMARY_COLOR,
          "&:hover": { backgroundColor: "#ffb57d" },
          py: 1.8,
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        결제하기
      </Button>
    </Box>
  );
};

export default PaymentDetail;
