import { Box, Button, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { searchId, searchPwd, sendSmsApi, verifyCode } from '../../../service/MemberService';

const PRIMARY_COLOR = '#f8792f';

const SearchIdPwd = () => {

  const [tab,setTab] = useState(0)
  const [form, setForm] = useState({
      userId: '',phone: '',name: '',code: '',email:''
    });
  
  const {userId,phone,name,code} = form

    const [message, setMessage] = useState({
      userId: '',name:'',phone: '',code: '',email:'',search:''
    });
  
    const [ok, setOk] = useState({
      userId: null,phone: null,name:null,phoneCheck: null,code: null,email:null,search:null
    });

  const handleTabChange = (e,newValue) => {
    setTab(newValue)
    setForm({
      userId: '',phone: '',name: '',code: '',email:''
    })
    setMessage({
      userId: '',name:'',phone: '',code: '',email:'',search:''
    })
    setOk({
      userId: null,phone: null,name:null,phoneCheck: null,code: null,email:null,search:null
    })
  }

  const changeInput = (evt) => {
    const { value, name } = evt.target;

    setForm((i) => ({
      ...i,
      [name]: value,
    }))

    if(name==='phone'){
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
        setMessage((prev) => ({ ...prev, phone: '휴대폰 번호를 정확히 입력해 주세요.' }));
        setOk((prev) => ({ ...prev, phone: false }));
      }
      return;
    }

    if(name==='email'){
       if (!value) {
        setMessage((prev) => ({ ...prev, email: '이메일을 입력해 주세요.' }));
        setOk((prev) => ({ ...prev, email: false }));
        return;
      }

      // 아주 기본적인 이메일 형식 체크
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(value)) {
        setMessage((prev) => ({ ...prev, email: '이메일 형식이 올바르지 않습니다.' }));
        setOk((prev) => ({ ...prev, email: false }));
      } else {
        setMessage((prev) => ({ ...prev, email: '' }));
        setOk((prev) => ({ ...prev, email: true }));
      }
      return;
    }
  }

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
    };
  }

  const verify = async() => {
    try {
      const res = await verifyCode(phone, code);
        setOk((prev) => ({ ...prev, code: true }));
        setMessage((prev) => ({ ...prev, code: '인증되었습니다.' }));
    } catch (err) {
      console.log(err);

      let msg = '조회 중 서버 오류가 발생했습니다. 다시 시도해 주세요.';

      if (err.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.message || err.response.data;

        if (status === 404) {
          msg = backendMsg || '인증 요청을 먼저 진행해 주세요.';
        } else if (status === 410) {
          msg = backendMsg || '인증번호가 만료되었습니다. 다시 요청해 주세요.';
        } else if (status === 401) {
          msg = backendMsg || '인증번호가 일치하지 않습니다.';
        } else if(status === 409) {
          msg = backendMsg || '이미 인증이 완료된 번호입니다.'
          setOk((prev) => ({ ...prev, code: true }));
        }
      }

      setOk((prev) => ({ ...prev, code: false }));
      setMessage((prev) => ({
        ...prev,
        code: msg,
      }));
    }
  };

  const onSearch = async() => {

    if(tab===0){
      try{
        const res = await searchId(form)

        setOk((prev) => ({...prev,search:true}))
        setMessage((prev) => ({...prev,search:`아이디는 [${res.data.userId}] 입니다.`}))
        return;
      }catch(err){

        let msg = '조회 중 서버 오류가 발생했습니다. 다시 시도해 주세요.';

        if(err.response){
          const status = err.response.status;
          const backendMsg = err.response.data?.message || err.response.data;

          if(status === 404) {
            msg = backendMsg || '입력한 정보와 일치하는 회원이 없습니다.'
          }else if(status === 400){
            msg = backendMsg || '입력값을 확인해 주세요.'
          }
        }

        setOk((prev) => ({...prev,search:true}))
        setMessage((prev) => ({...prev,search:msg}))
      }
      
    }else if(tab===1){
      try{
        const res = await searchPwd(form)

        setOk((prev) => ({...prev,search:true}))
        setMessage((prev) => ({...prev,search:res.data}))

        return;
      }catch(err){
        let msg = '조회 중 서버 오류가 발생했습니다. 다시 시도해 주세요.';

        if(err.response){
          const status = err.response.status;
          const backendMsg = err.response.data?.message || err.response.data;

          if(status === 404) {
            msg = backendMsg || '입력한 정보와 일치하는 회원이 없습니다.'
          }else if(status === 400){
            msg = backendMsg || '입력값을 확인해 주세요.'
          }
        }

        setOk((prev) => ({...prev,search:true}))
        setMessage((prev) => ({...prev,search:msg}))
      }
    }

  }

  const canSubmit =
    ok.code &&
    ok.phone &&
    ok.phoneCheck

  return (
    <Box
      sx={{
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
          maxWidth: 420,
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
            아이디/비밀번호 찾기
          </Typography>
        </Box>

        <Tabs value={tab} onChange={handleTabChange} variant='fullWidth' 
        textColor='inherit' indicatorColor='primary' 
        sx={{bgcolor: '#fff',
          '& .Mui-selected': {color: PRIMARY_COLOR,fontWeight: 'bold',},
          '& .MuiTabs-indicator': {backgroundColor: PRIMARY_COLOR,},
        }}
        >
          <Tab label="아이디 찾기"/>
          <Tab label="비밀번호 찾기"/>
        </Tabs>
        <Box sx={{p:4}}>
          {tab === 0 && 
            <Box>
              <TextField
                fullWidth
                label="이름"
                name="name"
                value={name}
                size="small"
                onChange={changeInput}
                margin="normal"
                required
              />
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  fullWidth
                  label="휴대폰 번호"
                  name="phone"
                  size="small"
                  placeholder="010-1234-5678"
                  value={formatPhone(phone)}
                  onChange={changeInput}
                  margin="normal"
                  required
                  disabled={ok.phoneCheck}
                />
                <Button
                  type="button"
                  variant="contained"
                  onClick={sendSms}
                  sx={{
                    mt: 1,
                    whiteSpace: 'nowrap',
                    bgcolor: PRIMARY_COLOR,
                    '&:hover': { bgcolor: PRIMARY_COLOR },
                  }}
                  disabled={ok.phone!==true}
                >
                  인증발송
                </Button>
              </Box>
      
              {/* 인증번호 입력 */}
              {ok.phoneCheck && (
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    fullWidth
                    label="인증 번호"
                    name="code"
                    size="small"
                    value={form.code}
                    onChange={changeInput}
                    margin="normal"
                    error={ok.code === false}
                    helperText={message.code}
                  />
                  <Button
                    type="button"
                    variant="contained"
                    onClick={verify}
                    sx={{
                      mt: 1,
                      whiteSpace: 'nowrap',
                      bgcolor: PRIMARY_COLOR,
                      '&:hover': { bgcolor: PRIMARY_COLOR },
                    }}
                  >
                    인증하기
                  </Button>
                </Box>
              )}
              <Button type="button"
                variant="contained"
                fullWidth
                onClick={onSearch}
                sx={{
                  mt: 1,
                  whiteSpace: 'nowrap',
                  bgcolor: PRIMARY_COLOR,
                  '&:hover': { bgcolor: PRIMARY_COLOR },
                }}
                disabled={ok.code!==true}
              >아이디 찾기</Button>
            </Box>
            
          }
          {tab === 0 && ok.search &&
            <Typography sx={{mt:2, textAlign:'center',fontWeight:'bold',color:PRIMARY_COLOR}}>
              {message.search}
            </Typography>
          }
          {tab === 1 &&
            <Box>
              <TextField
                label="아이디"
                name="userId"
                size="small"
                value={userId}
                onChange={changeInput}
                margin="normal"
                fullWidth
                error={ok.userId === false}
                helperText={message.userId}
                required
              />
              <TextField
                fullWidth
                label="이름"
                name="name"
                value={name}
                size="small"
                onChange={changeInput}
                margin="normal"
                required
              />
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  fullWidth
                  label="휴대폰 번호"
                  name="phone"
                  size="small"
                  placeholder="010-1234-5678"
                  value={formatPhone(form.phone)}
                  onChange={changeInput}
                  margin="normal"
                  required
                  disabled={ok.phoneCheck}
                />
                <Button
                  type="button"
                  variant="contained"
                  onClick={sendSms}
                  sx={{
                    mt: 1,
                    whiteSpace: 'nowrap',
                    bgcolor: PRIMARY_COLOR,
                    '&:hover': { bgcolor: PRIMARY_COLOR },
                  }}
                  disabled={ok.phone!==true}
                >
                  인증발송
                </Button>
              </Box>
      
              {/* 인증번호 입력 */}
              {ok.phoneCheck && (
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    fullWidth
                    label="인증 번호"
                    name="code"
                    size="small"
                    value={form.code}
                    onChange={changeInput}
                    margin="normal"
                    error={ok.code === false}
                    helperText={message.code}
                  />
                  <Button
                    type="button"
                    variant="contained"
                    onClick={verify}
                    sx={{
                      mt: 1,
                      whiteSpace: 'nowrap',
                      bgcolor: PRIMARY_COLOR,
                      '&:hover': { bgcolor: PRIMARY_COLOR },
                    }}
                  >
                    인증하기
                  </Button>
                </Box>
              )}
              <TextField
                fullWidth
                label="이메일"
                name="email"
                size="small"
                value={form.email}
                onChange={changeInput}
                margin="normal"
                error={ok.email === false}
                required
                helperText={message.email}
              />
              <Button
                type="button"
                variant="contained"
                fullWidth
                onClick={onSearch}
                sx={{
                  mt: 1,
                  whiteSpace: 'nowrap',
                  bgcolor: PRIMARY_COLOR,
                  '&:hover': { bgcolor: PRIMARY_COLOR },
                }}
                disabled={ok.code!==true || ok.email!==true}
              >임시비밀번호 발급</Button>
            </Box>
          }
          {tab === 1 && ok.search &&
            <Typography sx={{mt:2, textAlign:'center',fontWeight:'bold',color:PRIMARY_COLOR}}>
              {message.search}
            </Typography>
          }
        </Box>
      </Paper>
    </Box>
  );
};

export default SearchIdPwd;