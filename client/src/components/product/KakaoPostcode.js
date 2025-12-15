// src/components/common/KakaoPostcode.js
import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

/**
 * props:
 *  - onComplete: function({ postalCode, addr1, addr2 }) 호출
 *  - useLayer: boolean (레이어 형태로 띄우고 싶으면 true)
 */

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#FFC19E",
  color: "#fff",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "8px",
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "#FFB886",
  },
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
}));

const KakaoPostcode = ({ onComplete, useLayer = false }) => {
  const openPostcode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("우편번호 서비스 로드 실패. 페이지를 새로고침 해주세요.");
      return;
    }

    if (useLayer) {
      const element_layer = document.getElementById("postcodeLayer");
      const currentScroll = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
      new window.daum.Postcode({
        oncomplete: function (data) {
          const postalCode = data.zonecode || data.postcode || "";
          const addr1 = data.roadAddress || data.jibunAddress || "";
          onComplete && onComplete({ postalCode, addr1, addr2: "" });
          element_layer.style.display = "none";
        },
        onresize: function (size) {
          element_layer.style.height = size.height + "px";
        },
      }).embed(element_layer);

      element_layer.style.display = "block";
      element_layer.style.left = "50%";
      element_layer.style.top = `${currentScroll + 100}px`;
      element_layer.style.transform = "translateX(-50%)";
    } else {
      new window.daum.Postcode({
        oncomplete: function (data) {
          const postalCode = data.zonecode || data.postcode || "";
          const addr1 = data.roadAddress || data.jibunAddress || "";
          onComplete && onComplete({ postalCode, addr1, addr2: "" });
        },
      }).open();
    }
  };

  return (
    <>
      <StyledButton onClick={openPostcode}>
        주소검색
      </StyledButton>

      <div
        id="postcodeLayer"
        style={{
          display: "none",
          position: "absolute",
          top: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "400px",
          zIndex: 999,
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        }}
      />
    </>
  );
};

export default KakaoPostcode;
