import React, { useState } from "react";
import { Box, Typography, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button 
} from "@mui/material";

export default function Footer() {

  //어떤 모달을 열지 관리하는 상태 (null | "terms" | "privacy" | "cs")
  const [openModal, setOpenModal] = useState(null)

  const modalContent = {
    terms: {
      title: "이용약관",
      body: 
        ` 본 약관은 BaroFarm(이하 “회사”)이 제공하는 서비스 이용과 관련하여,  
        회원의 권리·의무 및 책임사항을 규정합니다.

        1. 서비스 이용  
        회사는 안정적인 서비스 제공을 위해 노력하며, 필요한 경우 서비스 내용을 변경할 수 있습니다.  
        회원은 서비스 이용 시 관련 법령과 약관을 준수해야 하며, 타인의 정보를 도용하거나 서비스를
        부정한 목적으로 이용해서는 안 됩니다.

        2. 게시물 및 거래  
        회원이 게시한 내용이 법령 또는 약관에 위반된다고 판단될 경우, 회사는 게시물을 삭제하거나
        제한할 수 있습니다.  
        회사는 회원 간의 개별 거래에 직접 개입하지 않으며, 거래 과정에서 발생하는 분쟁은 당사자간
        해결을 원칙으로 합니다.

        3. 개인정보 보호  
        회사는 개인정보보호법 등 관계 법령을 준수하며, 개인정보를 안전하게 보호합니다.

        4. 책임 제한  
        천재지변, 시스템 장애 등 불가항력으로 인해 서비스 제공이 어려운 경우 회사는 책임을  
        지지 않습니다.

        5. 약관 변경  
        회사는 법령에 따라 약관을 변경할 수 있으며, 변경 시 사전 공지합니다.  
        회원은 변경된 약관에 동의하지 않을 경우 이용계약을 해지할 수 있습니다.

        본 약관은 대한민국 법률을 따릅니다.`
    },
    privacy: {
      title: "개인정보처리방침",
      body: 
        ` BaroFarm(이하 “회사”)은 이용자의 개인정보를 소중하게 생각하며  
        개인정보보호법 등 관계 법령을 철저히 준수합니다.

        1. 수집 항목  
        회원가입 및 서비스 이용 과정에서 아래 정보가 수집될 수 있습니다.  
        - 이름, 아이디, 연락처, 이메일  
        - 배송지 정보, 결제 정보  
        - 접속 기록, 쿠키, 접속 IP 등 서비스 이용 기록

        2. 이용 목적  
        수집한 개인정보는 다음의 목적 내에서만 사용됩니다.  
        - 회원관리 및 본인확인  
        - 상품 주문 및 배송  
        - 고객 문의 처리  
        - 서비스 품질 향상 및 맞춤형 제공(동의한 경우)

        3. 보유 기간  
        법령에서 정한 기간 또는 이용 목적이 달성될 때까지 보관하며, 이후 안전하게 파기합니다.

        4. 제3자 제공  
        법령에 의한 경우 또는 이용자의 사전 동의가 있을 때를 제외하고 개인정보를 외부에 제공하지 않습니다.

        5. 이용자의 권리  
        이용자는 언제든지 개인정보 열람과 수정 또는 삭제를 요청할 수 있으며 회사는 지체없이
        조치합니다.

        6. 안전성 확보  
        회사는 개인정보를 암호화 저장하며, 접근권한 관리 및 보안 시스템 운영 등 필요한 모든
        보호조치를 취하고 있습니다.`
    },
    cs: {
      title: "고객센터",
      body:
        `< 바로팜 고객센터 안내 >

        • 운영시간 : 평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)  
        • 전화번호 : 02-1234-5678  
        • 이메일 : barofarm@naver.co.kr  

        문의하신 내용은 확인 후 신속하게 답변드리겠습니다.  
        서비스 이용 중 불편 사항이 있다면 언제든지 연락해 주세요.`
    }
  }

  //모달 열기/닫기
  const modalOpen = (type) => setOpenModal(type)
  const modalClose = () => setOpenModal(null)
  const currentModal = openModal ? modalContent[openModal] : null

  return (
    <>
      <Box
        sx={{
          background: "#fafafa",
          py: 2, mt: 10,color: "#666",
          borderTop: "1px solid #eee",
          textAlign: "center"
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 700, mb: 1 }}>
          BaroFarm Company
        </Typography>

        <Box sx={{ fontSize: "12px" }}>
          <Typography>대표자: 황태용</Typography>
          <Typography>
            사업자등록번호: 123-45-67890 / 전화번호: 02-1234-5678
          </Typography>
          <Typography>주소: 서울특별시 강남구 테헤란로 123</Typography>
        </Box>

        <Box sx={{ mt: 3, fontSize: "12px", fontWeight: 500, color: "#444" }}>
          <Typography component="span"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" }
            }} onClick={() => modalOpen("terms")} >
              이용약관
          </Typography>

          <Typography component="span"> &nbsp; | &nbsp; </Typography>

          <Typography component="span"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" }
            }} onClick={() => modalOpen("privacy")} >
              개인정보처리방침
          </Typography>

          <Typography component="span"> &nbsp; | &nbsp; </Typography>

          <Typography component="span"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" }
            }} onClick={() => modalOpen("cs")} >
              고객센터
          </Typography>
        </Box>

        <Typography sx={{ fontSize: "12px", color: "#999" }}>
          © 2025 BAROFARM. All rights reserved.
        </Typography>
      </Box>

      <Dialog open={Boolean(openModal)} onClose={modalClose}
        maxWidth="sm" fullWidth >

        <DialogTitle>{currentModal?.title}</DialogTitle>

        <DialogContent dividers>
          <Typography sx={{ whiteSpace: "pre-line", fontSize: "14px", lineHeight: 1.7 }} >
            {currentModal?.body}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={modalClose}
            variant="contained"
            size="small"
            
            sx={{ backgroundColor: "#fde0c7ff", color: "#000",
              "&:hover": { backgroundColor: "#f3c9a4ff" },
              borderRadius: "6px", px: 2 }}>
              닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}