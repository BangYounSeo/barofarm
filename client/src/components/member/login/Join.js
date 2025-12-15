import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { checkIdApi, join, sendSmsApi, verifyCode } from '../../../service/MemberService';
import Agreements from './Agreements';
import UserInfo from './UserInfo';

const PRIMARY_COLOR = '#f8792f';

const Join = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: '',
    pwd: '',
    pwdCheck: '',
    phone: '',
    name: '',
    phoneCheck: '',
    code: '',
    email:''
  });

  const [message, setMessage] = useState({
    userId: '',
    pwd: '',
    pwdCheck: '',
    phone: '',
    code: '',
    email:''
  });

  const [ok, setOk] = useState({
    userId: null,
    pwd: null,
    pwdCheck: null,
    phone: null,
    phoneCheck: null,
    code: null,
    email:null
  });

  const [agree, setAgree] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  const [loading, setLoading] = useState(false);

  const { userId, pwd, phone, name, pwdCheck, code } = form;

  const changeInput = (evt) => {
    const { value, name } = evt.target;

    setForm((i) => ({
      ...i,
      [name]: value,
    }));

    if (name === 'userId') {
      if (!value) {
        setMessage((prev) => ({ ...prev, userId: '아이디 입력은 필수입니다.' }));
        setOk((prev) => ({ ...prev, userId: false }));
        return;
      }
      const regexId = /^[a-zA-Z0-9]{6,}$/;
      setMessage((prev) => ({
        ...prev,
        userId: !regexId.test(value)
          ? '아이디는 영문 또는 숫자 6자 이상 입력해 주세요.'
          : '',
      }));
      setOk((prev) => ({ ...prev, userId: regexId.test(value) }));
      if (!regexId.test(value)) return;
    }

    if (name === 'pwd') {
      if (!value) {
        setMessage((prev) => ({ ...prev, pwd: '비밀번호를 입력해 주세요.' }));
        setOk((prev) => ({ ...prev, pwd: false }));
        return;
      }
      const regexPwd = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      setMessage((prev) => ({
        ...prev,
        pwd: !regexPwd.test(value)
          ? '비밀번호는 특수문자 1개 포함 8자 이상 입력해 주세요'
          : '',
      }));
      setOk((prev) => ({ ...prev, pwd: regexPwd.test(value) }));
      if (!regexPwd.test(value)) return;
    }

    if (name === 'email') {
      if (!value) {
        setMessage((prev) => ({
          ...prev,
          email: '이메일을 입력해 주세요.',
        }));
        setOk((prev) => ({ ...prev, email: false }));
        return;
      }

      // 아주 심플한 이메일 형식 체크
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!regexEmail.test(value)) {
        setMessage((prev) => ({
          ...prev,
          email: '올바른 이메일 형식이 아닙니다.',
        }));
        setOk((prev) => ({ ...prev, email: false }));
      } else {
        setMessage((prev) => ({
          ...prev,
          email: '',
        }));
        setOk((prev) => ({ ...prev, email: true }));
      }
    }

    if (name === 'phone') {
      if (!value) {
        setMessage((prev) => ({ ...prev, phone: '휴대폰 번호를 입력해 주세요.' }));
        setOk((prev) => ({ ...prev, phone: false }));
        return;
      }

      const onlyNums = value.replace(/\D/g, '').slice(0, 11);

      setForm((i) => ({
        ...i,
        phone: onlyNums,
      }));

      if (onlyNums.length === 10 || onlyNums.length === 11) {
        setMessage((prev) => ({ ...prev, phone: '' }));
        setOk((prev) => ({ ...prev, phone: true }));
      } else {
        setMessage((prev) => ({
          ...prev,
          phone: '휴대폰 번호를 정확히 입력해 주세요.',
        }));
        setOk((prev) => ({ ...prev, phone: false }));
      }

      return;
    }
  };

  const formatPhone = (value) => {
    if (!value) return '';
    const onlyNums = value.replace(/\D/g, '');
    if (onlyNums.length <= 3) return onlyNums;
    if (onlyNums.length <= 7)
      return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
    return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(
      7,
      11
    )}`;
  };

  useEffect(() => {
    if (!pwdCheck) {
      setMessage((prev) => ({ ...prev, pwdCheck: '' }));
      setOk((prev) => ({ ...prev, pwdCheck: null }));
      return;
    }

    setMessage((prev) => ({
      ...prev,
      pwdCheck: pwd === pwdCheck ? '' : '비밀번호가 일치하지 않습니다.',
    }));
    setOk((prev) => ({ ...prev, pwdCheck: pwd === pwdCheck }));
  }, [pwd, pwdCheck]);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const res = await join(form);
      // console.log(res.data);

      setForm({
        userId: '',
        pwd: '',
        pwdCheck: '',
        phone: '',
        name: '',
        phoneCheck: '',
        code: '',
        email:''
      });
      setAgree({ all: false, terms: false, privacy: false, marketing: false });
      navigate('/member/login');
      alert('회원가입이 완료되었습니다.');
    } catch (err) {
      console.log(err);
      alert('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const checkId = async () => {
    try {
      const res = await checkIdApi(userId);
      setMessage((prev) => ({ ...prev, userId: res.data }));
      setOk((prev) => ({ ...prev, userId: true }));
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.message || err.response.data;

        if (status === 409) {
          alert(backendMsg || '이미 사용 중인 아이디입니다.');
          return;
        }

        if (status === 400) {
          alert(backendMsg || '입력값을 다시 확인해 주세요.');
          return;
        }
      }
    }
  };

  const sendSms = async () => {
    try {
      if (!ok.phone) {
        setMessage((prev) => ({
          ...prev,
          phone: '휴대폰 번호를 정확히 입력해 주세요.',
        }));
        return;
      }
      await sendSmsApi(phone);

      setOk((prev) => ({ ...prev, phoneCheck: true }));
      setMessage((prev) => ({
        ...prev,
        phone: '인증번호가 발송되었습니다. 5분 이내에 입력해 주세요.',
      }));
    } catch (err) {
      console.log(err);
      let msg = '인증번호 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

      if (err.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.message || err.response.data;

        // 예: 너무 자주 요청하면 429로 줄 수도 있음
        if (status === 429) {
          msg = backendMsg || '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
        } else if (status === 400) {
          msg = backendMsg || '요청 형식이 올바르지 않습니다.';
        }
      }

      setOk((prev) => ({ ...prev, phoneCheck: false }));
      setMessage((prev) => ({ ...prev, phone: msg }));
    }
  };

  const verify = async () => {
    try {
      const res = await verifyCode(phone, code);
      setOk((prev) => ({ ...prev, code: true }));
      setMessage((prev) => ({ ...prev, code: '인증되었습니다.' }));
    } catch (err) {

      console.log(err);

      let msg = '인증 중 서버 오류가 발생했습니다. 다시 시도해 주세요.';

      if (err.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.message || err.response.data;

        if (status === 404) {
          msg = backendMsg || '인증 요청을 먼저 진행해 주세요.';
        } else if (status === 410) {
          msg = backendMsg || '인증번호가 만료되었습니다. 다시 요청해 주세요.';
        } else if (status === 401) {
          msg = backendMsg || '인증번호가 일치하지 않습니다.';
        }
      }

      setOk((prev) => ({ ...prev, code: false }));
      setMessage((prev) => ({
        ...prev,
        code: msg,
      }));
    }
  };

  const handleAgreeChange = (e) => {
    const { name, checked } = e.target;

    if (name === 'all') {
      setAgree({
        all: checked,
        terms: checked,
        privacy: checked,
        marketing: checked,
      });
      return;
    }

    setAgree((prev) => {
      const next = { ...prev, [name]: checked };
      next.all = next.terms && next.privacy && next.marketing;
      return next;
    });
  };

  const canSubmit =
    !loading &&
    ok.code &&
    ok.pwd &&
    ok.pwdCheck &&
    ok.userId &&
    ok.email &&
    agree.terms &&
    agree.privacy;

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
      sx={{
        minHeight: '100vh',
        bgcolor:
          'linear-gradient(135deg, #fff7f0 0%, #ffe1cc 50%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* 메인 카드 */}
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* 상단 헤더 영역 */}
        <Box
          sx={{
            bgcolor: PRIMARY_COLOR,
            color: '#fff',
            px: 3,
            py: 2.5,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            바로팜 회원가입
          </Typography>
          <Typography variant="body2" mt={0.5} sx={{ opacity: 0.9 }}>
            농산물 직거래 서비스를 이용하시려면 회원가입이 필요합니다.
          </Typography>
        </Box>

        {/* 내용 영역 */}
        <Box sx={{ px: 3, py: 3.5 }}>

          <UserInfo form={form} ok={ok} message={message} changeInput={changeInput} formatPhone={formatPhone} PRIMARY_COLOR={PRIMARY_COLOR} sendSms={sendSms} checkId={checkId} verify={verify} />
          {/* 구분선 */}
          <Divider sx={{ my: 3 }} />

          <Agreements agree={agree} handleAgreeChange={handleAgreeChange} />

          {/* 가입 버튼 */}
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
            약관 동의 후 회원가입
          </Button>

          {/* 아래 로그인 링크 정도 넣고 싶으면 */}
          <Box
            sx={{
              mt: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              이미 계정이 있으신가요?{' '}
              <Button
                size="small"
                sx={{ color: PRIMARY_COLOR, fontWeight: 600, ml: -1 }}
                onClick={() => navigate('/member/login')}
              >
                로그인
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Join;
