// src/pages/member/ProducerAgreements.js
import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ProducerAgreements = ({ agree, handleAgreeChange }) => {
  return (
    <Box>
      {/* STEP 02 */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="overline" color="text.secondary">
          STEP 01
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          판매자 약관 동의
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          필수 약관에 동의하셔야 판매자 등록이 가능합니다.
        </Typography>
      </Box>

      {/* 전체 동의 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          mt: 1,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              name="all"
              checked={agree.all}
              onChange={handleAgreeChange}
            />
          }
          label="전체 동의"
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mr: 1 }}
        >
          (선택 항목 포함)
        </Typography>
      </Box>

      <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        {/* [필수] 판매자 이용약관 */}
        <Accordion sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FormControlLabel
              control={
                <Checkbox
                  name="terms"
                  checked={agree.terms}
                  onChange={handleAgreeChange}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              label="[필수] 판매자 이용약관"
            />
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                maxHeight: 150,
                overflow: 'auto',
                fontSize: 14,
                whiteSpace: 'pre-line',
              }}
            >
              {`본 약관은 판매자가 서비스를 통해 상품을 판매함에 있어 준수해야 할 사항을 규정합니다.

1. 상품 정보 및 가격
- 판매자는 실제와 일치하는 상품 정보 및 가격을 제공해야 합니다.
- 허위 또는 과장 광고를 할 수 없습니다.

2. 주문, 배송, 환불
- 구매자의 주문을 성실히 이행해야 하며,
정해진 기간 내 배송 및 발송 처리를 해야 합니다.
- 환불 및 교환 요청 발생 시 관련 법령과 서비스 정책을 준수해야 합니다.

3. 품질 및 안전
- 판매자는 관련 법령을 준수하며 안전한 상품만을 판매해야 합니다.
- 유통기한 경과, 변질, 불량 상품 판매 시 서비스 이용이 제한될 수 있습니다.`}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* [필수] 개인정보 처리 및 위탁 */}
        <Accordion sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FormControlLabel
              control={
                <Checkbox
                  name="privacy"
                  checked={agree.privacy}
                  onChange={handleAgreeChange}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              label="[필수] 구매자 개인정보 처리 동의"
            />
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                maxHeight: 150,
                overflow: 'auto',
                fontSize: 14,
                whiteSpace: 'pre-line',
              }}
            >
              {`판매자는 주문 처리, 배송, 고객 응대 목적 외의 용도로
구매자의 개인정보를 이용하거나 제3자에게 제공할 수 없습니다.

1. 이용 목적
- 상품 배송 및 A/S 등 주문 처리
- 구매자 문의 및 민원 응대

2. 보유 기간
- 관련 법령에서 정한 기간 동안 보관 후 파기합니다.

3. 책임
- 개인정보 유출 시, 판매자는 관련 법령에 따른 책임을 질 수 있습니다.`}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default ProducerAgreements;
