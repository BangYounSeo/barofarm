import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';

const Agreements = ({agree,handleAgreeChange}) => {
  return (
    <Box>
      {/* 02. 약관동의 섹션 헤더 */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="overline" color="text.secondary">
          STEP 02
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          약관 동의
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          필수 약관에 동의하셔야 회원가입이 가능합니다.
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

      {/* 약관 아코디언들 */}
      <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        {/* [필수] 서비스 이용약관 */}
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
              label="[필수] 서비스 이용약관"
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
              {`본 약관은 귀하가 서비스를 이용함에 있어 준수해야 할 기본적인 사항을 규정합니다.

1. 서비스 제공
- 회사는 서비스 유지 및 개선을 위해 필요한 조치를 취할 수 있으며,
서비스 내용은 사전 공지 후 변경될 수 있습니다.

2. 회원 계정
- 회원은 타인의 정보를 사용할 수 없으며,
회원 정보는 정확하고 최신 상태로 유지해야 합니다.
- 계정 및 비밀번호 관리 책임은 회원에게 있습니다.

3. 게시물 작성
- 회원은 불법, 음란, 명예훼손, 저작권 침해 등의
제3자의 권리를 침해하는 게시물을 등록할 수 없습니다.
- 회사는 관련 법률에 의해 필요할 경우 게시물을 삭제할 수 있습니다.

4. 서비스 이용 제한
- 회사는 약관 위반, 불법 행위, 부정 이용이 확인될 경우
서비스 이용을 제한하거나 계정을 해지할 수 있습니다.`}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* [필수] 개인정보 수집 및 이용 */}
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
              label="[필수] 개인정보 수집 및 이용"
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
              {`회사는 회원가입 및 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.

1. 수집 항목
- 필수: 아이디, 비밀번호, 이름, 휴대폰 번호, 인증번호 기록
- 선택: 마케팅 수신 동의 여부

2. 수집 목적
- 회원가입 및 본인 확인
- 서비스 제공 및 이용자 식별
- 부정 이용 방지 및 보안 강화

3. 보유 및 이용 기간
- 회원 탈퇴 시 즉시 파기
- 다만, 관련 법령에 따라 일정 기간 보관이 필요한 경우에는
법령에서 정한 기간 동안 보관합니다.`}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* [선택] 마케팅/광고 수신 동의 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FormControlLabel
              control={
                <Checkbox
                  name="marketing"
                  checked={agree.marketing}
                  onChange={handleAgreeChange}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              label="[선택] 마케팅/광고 수신 동의"
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
              {`회사는 아래의 목적을 위해 선택적으로 개인정보를 이용할 수 있습니다.

1. 이용 목적
- 이벤트, 프로모션, 신규 서비스 안내
- 할인 및 맞춤형 광고 정보 제공

2. 전송 방법
- SMS, 이메일, 앱 푸시 등

3. 동의 거부 권리
- 동의를 거부하더라도 서비스 이용에 제한은 없습니다.
- 마케팅 수신 동의는 언제든지 철회할 수 있습니다.`}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default Agreements;