// src/pages/member/ProducerInfo.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Typography,
  Modal,
} from '@mui/material';
import DaumPostCode from 'react-daum-postcode';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const ProducerInfo = ({ form, ok, message, changeInput, verifyBiz, PRIMARY_COLOR }) => {
  const {
    producerType,
    farmName,
    ceoName,
    bizNo,
    openDate,
    phone,
    postalCode,
    addr1,
    addr2,
    bank,
    accountNumber,
    accountHolder,
    settleEmail,
    intro,
    startCall,
    endCall
  } = form;

  const [openPostcode, setOpenPostcode] = useState(false)

  const handleComplete = (data) => {
    const { zonecode, address } = data;
    changeInput({ target: { name: 'postalCode', value: zonecode } })
    changeInput({ target: { name: 'addr1', value: address } })
    setOpenPostcode(false);
  }

  return (
    <Box sx={{ display: 'flex', flexFlow: 'column' }}>
      {/* STEP 01 */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="overline" color="text.secondary">
          STEP 02
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          판매자 기본 정보
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          판매자 기본 정보를 입력해 주세요.
        </Typography>
      </Box>

      <Box sx={{ mt: 1, mb: 2 }}>
        <Typography variant="body2">
          이 서비스의 판매자는 <b>사업자등록증이 있는 사업자만</b> 등록할 수 있습니다.
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" fontWeight="bold">
          사업자 등록 정보
        </Typography>
        <Typography variant="caption" color="text.secondary">
          국세청에 등록된 사업자 정보를 기준으로 확인합니다.
        </Typography>
      </Box>

      {/* 상호/농장명 */}
      <TextField
        fullWidth
        label="상호 / 농장명"
        name="farmName"
        value={farmName}
        size="small"
        onChange={changeInput}
        margin="normal"
        error={ok.farmName === false}
        helperText={message.farmName}
      />

      {/* 사업자 정보 (사업자 판매자일 때만) */}
      <Box display="flex" gap={1} alignItems="center">
        <TextField
          fullWidth
          label="사업자등록번호 (하이픈 제외)"
          name="bizNo"
          size="small"
          value={bizNo}
          onChange={changeInput}
          margin="normal"
        />
        <Button
          type="button"
          variant="contained"
          onClick={verifyBiz}
          sx={{
            mt: 1,
            whiteSpace: 'nowrap',
            bgcolor: PRIMARY_COLOR,
            '&:hover': { bgcolor: PRIMARY_COLOR },
          }}
        >
          사업자 확인
        </Button>
      </Box>
      {!ok.bizVerified &&
        <Typography variant='caption' sx={{ color: 'red', ml: 1 }}>
          {message.bizNo}
        </Typography>
      }

      {/* 대표자 이름 */}
      <TextField
        fullWidth
        label="대표자 이름"
        name="ceoName"
        value={ceoName}
        size="small"
        onChange={changeInput}
        margin="normal"
      />

      <TextField
        fullWidth
        label="개업일자 (YYYYMMDD)"
        name="openDate"
        size="small"
        value={openDate}
        onChange={changeInput}
        margin="normal"
        helperText={message.openDate}
      />

      {/* 연락처 */}
      <TextField
        fullWidth
        label="연락처 또는 문의용 전화번호"
        name="phone"
        size="small"
        value={phone}
        onChange={changeInput}
        margin="normal"
        placeholder="01012345678"
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'flex', flexFlow: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1 }}>
          <TimePicker
            label="문의 시작 시간"
            value={startCall ? dayjs(startCall, "HH:mm") : null}
            onChange={(newValue) => {
              changeInput({ target: { name: "startCall", value: newValue.format("HH:mm") } });
            }}
            slotProps={{
              textField: {
                size: "small", // TextField의 size를 small로 설정
                sx: {
                  "& .MuiInputBase-root": {
                    height: 40, // <-- height 맞추기 (기본 small 높이와 동일)
                  },
                  "& .MuiInputBase-input": {
                    padding: "8.5px 14px", // <-- TextField small padding과 동일
                  },
                },
              },
            }}
          />
          <Typography alignItems='center'>~</Typography>
          <TimePicker
            label="문의 종료 시간"
            value={endCall ? dayjs(endCall, "HH:mm") : null}
            onChange={(newValue) => {
              changeInput({ target: { name: "endCall", value: newValue.format("HH:mm") } });
            }}
            slotProps={{
              textField: {
                size: "small", // TextField의 size를 small로 설정
                sx: {
                  "& .MuiInputBase-root": {
                    height: 40, // <-- height 맞추기 (기본 small 높이와 동일)
                  },
                  "& .MuiInputBase-input": {
                    padding: "8.5px 14px", // <-- TextField small padding과 동일
                  },
                },
              },
            }}
          />
        </Box>
      </LocalizationProvider>

      {/* 주소 */}
      <Box display='flex' gap={1} alignItems='center'>
        <TextField
          fullWidth
          label="우편번호"
          name="postalCode"
          size="small"
          value={postalCode}
          onChange={changeInput}
          margin="normal"
        />
        <Button type='button' variant='contained'
          onClick={() => setOpenPostcode(true)}
          sx={{
            mt: 1, whiteSpace: 'nowrap', bgcolor: PRIMARY_COLOR,
            '&:hover': { bgcolor: PRIMARY_COLOR },
          }}>
          주소검색
        </Button>
      </Box>
      <TextField
        fullWidth
        label="주소"
        name="addr1"
        size="small"
        value={addr1}
        onChange={changeInput}
        margin="normal"
      />
      <TextField
        fullWidth
        label="상세 주소"
        name="addr2"
        size="small"
        value={addr2}
        onChange={changeInput}
        margin="normal"
      />

      <Modal open={openPostcode} onClose={() => setOpenPostcode(false)}>
        <Box
          sx={{
            position: 'absolute', top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: '#fff',
            p: 2,
            boxShadow: 24,
            borderRadius: 2,
            width:{lg:500,xs:'90%'}}}
        >
          <DaumPostCode onComplete={handleComplete} style={{height:500}} />
        </Box>
      </Modal>

      {/* 택배 정보 */}
      <TextField
        fullWidth
        label="택배사"
        name="courier"
        value={form.courier}
        onChange={changeInput}
        sx={{ mt: 2 }}
      />

      <TextField
        fullWidth
        label="반품 배송비 (원)"
        name="returnShippingFee"
        type="number"
        value={form.returnShippingFee}
        onChange={changeInput}
        sx={{ mt: 1 }}
      />

      <TextField
        fullWidth
        label="교환 배송비 (원)"
        name="exchangeShippingFee"
        type="number"
        value={form.exchangeShippingFee}
        onChange={changeInput}
        sx={{ mt: 1 }}
      />

      {/* 정산 정보 */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight="bold">
          정산 계좌 정보
        </Typography>
      </Box>

      <TextField
        select
        fullWidth
        label="은행명"
        name="bank"
        value={bank}
        onChange={changeInput}
        margin="normal"
        size="small"
      >
        <MenuItem value="KB">국민은행</MenuItem>
        <MenuItem value="NH">농협은행</MenuItem>
        <MenuItem value="SH">신한은행</MenuItem>
        <MenuItem value="WR">우리은행</MenuItem>
      </TextField>

      <TextField
        fullWidth
        label="계좌번호"
        name="accountNumber"
        value={accountNumber}
        onChange={changeInput}
        margin="normal"
        size="small"
      />

      <TextField
        fullWidth
        label="예금주"
        name="accountHolder"
        value={accountHolder}
        onChange={changeInput}
        margin="normal"
        size="small"
      />

      <TextField
        fullWidth
        label="정산용 이메일"
        name="settleEmail"
        value={settleEmail}
        onChange={changeInput}
        margin="normal"
        size="small"
      />

      <TextField
        fullWidth
        label="판매자 소개"
        name="intro"
        value={intro}
        onChange={changeInput}
        margin="normal"
        size="small"
        multiline
        minRows={3}
        placeholder="농장 소개, 재배 방식, 주요 품목 등을 작성해 주세요."
      />
    </Box>
  );
};

export default ProducerInfo;
