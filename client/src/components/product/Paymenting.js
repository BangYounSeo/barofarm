// src/components/product/PaymentSuccess.js
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../service/AxiosConfig";
import "./payment.css";
const Paymenting = () => {

const location = useLocation();      // ✅ 추가
    const navigate = useNavigate(); 

    useLayoutEffect(() => {
        const token = localStorage.getItem("token");
    
        if(!token) {
          alert("로그인을 해주세요.")
          window.location.href = '/member/login'
          return;
        }
      
    })
    // ⭐ PortOne redirect 시 전달되는 결제ID
    const paymentId = new URLSearchParams(location.search).get("paymentId");
    const type = new URLSearchParams(location.search).get("type");
    console.log("paymentId",paymentId)
    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const res = await api.post(`/payment/verify?paymentId=${paymentId}&type=${type}`);;
                console.log("결제 검증 완료:", res.data);
                navigate(`/payment/success?paymentId=${paymentId}`);
            } catch (error) {
                console.error("결제 검증 실패:", error);
                alert("결제 검증에 실패했습니다.\n고객센터에 문의해주세요.");
                navigate("/");
            }
        };

        if (paymentId) verifyPayment();
    }, [paymentId, navigate]);
    return (
        <div>
            
        </div>
    );
};

export default Paymenting;