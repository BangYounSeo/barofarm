// src/pages/member/ProducerJoin.js
import React, { useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import ProducerInfo from './ProducerInfo';
import ProducerAgreements from './ProducerAgreement';
import { applyProducer, verifyBizApi } from '../../../service/MemberService';

const PRIMARY_COLOR = '#f8792f';

const steps = ['판매자 약관 동의', '판매자 기본 정보']

const ProducerJoin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    producerType: 'BUSINESS', // PERSON or BUSINESS
    farmName: '',
    ceoName: '',
    bizNo: '',
    openDate: '',
    phone: '',
    postalCode: '',
    addr1: '',
    addr2: '',
    bank: '',
    accountNumber: '',
    accountHolder: '',
    settleEmail: '',
    intro: '',
    startCall: null,
    endCall: null,
    courier: '',
    returnShippingFee: '',
    exchangeShippingFee: '',
  });

  const [message, setMessage] = useState({
    farmName: '',
    bizNo: '',
    openDate: '',
    bank: '',
    accountNumber: '',
    accountHolder: '',
    startCall: '',
    endCall: '',
  });

  const [ok, setOk] = useState({
    farmName: null,
    bizVerified: null, // 사업자 검증 성공 여부
  });

  const [agree, setAgree] = useState({
    all: false,
    terms: false,
    privacy: false,
  });

  const [loading, setLoading] = useState(false);

  const [activeStep, setActiveStep] = useState(0)

  const changeInput = (e) => {
    const { name, value } = e.target;

    // 공통 폼 업데이트
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'farmName') {
      if (!value) {
        setMessage((prev) => ({
          ...prev,
          farmName: '상호/농장명을 입력해 주세요.',
        }));
        setOk((prev) => ({ ...prev, farmName: false }));
      } else {
        setMessage((prev) => ({ ...prev, farmName: '' }));
        setOk((prev) => ({ ...prev, farmName: true }));
      }
    }

    if (name === 'bizNo') {
      // 숫자만 10자리로 제한
      const onlyNums = value.replace(/\D/g, '').slice(0, 10);
      setForm((prev) => ({ ...prev, bizNo: onlyNums }));

      if (onlyNums.length !== 10) {
        setMessage((prev) => ({
          ...prev,
          bizNo: '사업자등록번호 10자리를 입력해 주세요.',
        }));
        setOk((prev) => ({ ...prev, bizVerified: false }));
      } else {
        setMessage((prev) => ({ ...prev, bizNo: '' }));
      }
    }

    if (name === 'openDate') {
      // YYYYMMDD 형식 숫자만
      const onlyNums = value.replace(/\D/g, '').slice(0, 8);
      setForm((prev) => ({ ...prev, openDate: onlyNums }));
      if (onlyNums.length !== 8) {
        setMessage((prev) => ({
          ...prev,
          openDate: '개업일자를 YYYYMMDD 형식으로 입력해 주세요.',
        }));
      } else {
        setMessage((prev) => ({ ...prev, openDate: '' }));
      }
    }
  };

  const handleAgreeChange = (e) => {
    const { name, checked } = e.target;

    if (name === 'all') {
      setAgree({
        all: checked,
        terms: checked,
        privacy: checked,
      });
      return;
    }

    setAgree((prev) => {
      const next = { ...prev, [name]: checked };
      next.all = next.terms && next.privacy;
      return next;
    });
  };

  useLayoutEffect(() => {
    const token = localStorage.getItem("token");
  
    if(!token) {window.location.href = '/member/login'}
  })
  
  // 국세청 사업자번호 검증 (예시용)
  const verifyBiz = async () => {
    if (form.producerType !== 'BUSINESS') return;

    if (form.bizNo.length !== 10 || form.openDate.length !== 8 || !form.ceoName) {
      setMessage((prev) => ({
        ...prev,
        bizNo: prev.bizNo || '사업자번호, 대표자명, 개업일자를 모두 입력해 주세요.',
      }));
      setOk((prev) => ({ ...prev, bizVerified: false }));
      return;
    }

    try {
      setLoading(true);
      // 예: { bizNo, ceoName, openDate }를 보내서 국세청 API 확인
      await verifyBizApi({
        b_no: form.bizNo,
        p_nm: form.ceoName,
        start_dt: form.openDate,
      });

      setOk((prev) => ({ ...prev, bizVerified: true }));
      setMessage((prev) => ({ ...prev, bizNo: '유효한 사업자로 확인되었습니다.' }));
    } catch (err) {
      console.log(err);
      let msg = '사업자 등록 정보 확인 중 오류가 발생했습니다.';

      if (err.response) {
        const status = err.response.status;

        if (status === 404) {
          msg = '등록되지 않은 사업자입니다.';
        } else if (status === 409) {
          msg = err.response.data || '입력한 정보가 국세청 정보와 일치하지 않습니다.';
        } else if (status === 400) {
          msg = '사업자 정보 형식이 올바르지 않습니다.';
        } else if (status === 502 || status === 500) {
          msg = '국세청 서비스가 원활하지 않습니다. 잠시 후 다시 시도해 주세요.';
        }
      } else {
        msg = '서버와 통신할 수 없습니다. 네트워크 상태를 확인해 주세요.';
      }

      setOk((prev) => ({ ...prev, bizVerified: false }));
      setMessage((prev) => ({ ...prev, bizNo: msg }));
    } finally {
      setLoading(false);
    }
  };

  const canNextStep0 = agree.terms && agree.privacy;

  const handleNext = async () => {
    if (activeStep === 0 && !canNextStep0) return;
    setActiveStep(1)
  }

  const canSubmit =
    !loading &&
    ok.farmName &&
    agree.terms &&
    agree.privacy &&
    (form.producerType === 'PERSON' || ok.bizVerified); // 사업자는 국세청 검증 필수

  const onSubmit = async (e) => {
    e.preventDefault();
    if (activeStep !== 1) return;
    if (!canSubmit) return;

    try {
      setLoading(true);
      await applyProducer(form); // axios.post('/api/producer', form) 같은 느낌

      alert('판매자 등록 신청이 완료되었습니다.\n관리자 승인 후 판매가 가능합니다.');
      navigate('/user/mypage');
    } catch (err) {
      console.log(err);
      const msg =
        err.response?.data?.message ||
        '판매자 등록 신청 중 오류가 발생했습니다.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        minHeight: '0vh',
        bgcolor: 'linear-gradient(135deg, #fff7f0 0%, #ffe1cc 50%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 600,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* 상단 헤더 */}
        <Box
          sx={{
            bgcolor: PRIMARY_COLOR,
            color: '#fff',
            px: 3,
            py: 2.5,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            판매자 등록 신청
          </Typography>
          <Typography variant="body2" mt={0.5} sx={{ opacity: 0.9 }}>
            농산물 판매를 위해 판매자 정보를 등록해 주세요.
          </Typography>
        </Box>

        {/* 내용 */}
        <Box sx={{ px: 3, py: 3.5 }}>
          {activeStep === 0 &&
            <ProducerAgreements
              agree={agree}
              handleAgreeChange={handleAgreeChange}
            />
          }
          {activeStep === 1 &&
            <ProducerInfo
              form={form}
              ok={ok}
              message={message}
              changeInput={changeInput}
              verifyBiz={verifyBiz}
              PRIMARY_COLOR={PRIMARY_COLOR}
            />
          }
          {activeStep === 0 && (
            <Button
              type="button"
              fullWidth
              variant="contained"
              onClick={handleNext}
              sx={{
                mt: 1,
                bgcolor: PRIMARY_COLOR,
                '&:hover': { bgcolor: PRIMARY_COLOR },
                py: 1,
                borderRadius: 999,
                fontWeight: 'bold',
              }}
              disabled={!canNextStep0}
            >
              다음
            </Button>
          )}
          {activeStep === 1 &&
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                bgcolor: PRIMARY_COLOR,
                '&:hover': { bgcolor: PRIMARY_COLOR },
                py: 1,
                borderRadius: 999,
                fontWeight: 'bold',
              }}
              disabled={!canSubmit}
            >
              판매자 등록 신청하기
            </Button>
          }
        </Box>
      </Paper>
    </Box>
  );
};

export default ProducerJoin;
