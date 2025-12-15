import React, { useContext, useState } from 'react';
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import kakaoLogo from '../../../assets/loginLogos/kakaotalk_sharing_btn_medium_ov.png'
import naverLogo from '../../../assets/loginLogos/btnG_아이콘원형.png'
import googleLogo from '../../../assets/loginLogos/web_light_rd_na@1x.png'
import { MemberContext } from './MemberContext';
import { login } from '../../../service/MemberService';

const PRIMARY_COLOR = '#f8792f';

const Login = () => {

  const [form,setForm] = useState({
    userId:'',pwd:''
  })
  
  const location = useLocation();

  const {setAuthFromToken} = useContext(MemberContext);
  
  const [failed,setFailed] = useState(false)
  const {userId,pwd} = form
  const navigate = useNavigate();

  const changeInput = (evt) => {
    const {value,name} = evt.target

    setForm(i => ({
      ...i,[name]:value
    }))
  }

  const [msg,setMsg] = useState("")

  const loginWithKakao = () => {
    window.location.href = "http://192.168.0.34:8080/oauth2/authorization/kakao";
  };

  const loginWithNaver = () => {
    window.location.href = "http://192.168.0.34:8080/oauth2/authorization/naver";
  };

  const loginWithGoogle = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const onSubmit = async(e) => {
    try {
      e.preventDefault();

      const {tempPwd,token,userType} = await login(form)

      setForm({userId:'',pwd:''})
      setFailed(false)

      if(tempPwd === 1) {
        alert('임시 비밀번호상태 입니다. 비밀번호를 변경해 주세요.')
      }

      setAuthFromToken(token);

      const redirectUrl = location.state?.redirectUrl || '/'

      window.location.href = redirectUrl
    }catch (err){

      setFailed(true)

      if(err.response){

        const status = err.response.status;
        const backendMsg = err.response.data?.message || err.response.data;
        
       setMsg('아이디 또는 비밀번호를 확인해 주세요.');

        if(status===403){
          setMsg(backendMsg || '현재 사용이 제한된 계정입니다. 관리자에게 문의해 주세요')
        }else if(status===409){
          setMsg(backendMsg || '현재 사용이 제한된 계정입니다. 관리자에게 문의해 주세요')
        }
      }
      console.log(err)
    }
  }

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
            바로팜 로그인
          </Typography>
          <Typography variant="body2" mt={0.5} sx={{ opacity: 0.9 }}>
            농산물 직거래 서비스에 로그인해 주세요.
          </Typography>
        </Box>

        {/* 폼 영역 */}
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ px: 3, py: 3.5 }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            mb={2}
          >
            가입하신 아이디와 비밀번호를 입력해 주세요.
          </Typography>

          <TextField
            fullWidth
            size="small"
            label="아이디"
            name="userId"
            value={userId}
            onChange={changeInput}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            label="비밀번호"
            type="password"
            name="pwd"
            value={pwd}
            onChange={changeInput}
            sx={{ mb: 2 }}
          />

          {failed && (
            <Alert severity="error" sx={{ mb: 2, fontSize: 14 }}>
              {msg}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              mb: 1.5,
              color:PRIMARY_COLOR,
              bgcolor:'#ffffff',
              borderColor:PRIMARY_COLOR,
              py: 1,
              borderRadius: 999,
              fontWeight: 'bold',
            }}
          >
            로그인
          </Button>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
  
            {/* Kakao */}
            <img
              src={kakaoLogo}
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                cursor: "pointer"
              }}
              onClick={loginWithKakao}
            />

            {/* Naver */}
            <img
              src={naverLogo}
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                cursor: "pointer"
              }}
              onClick={loginWithNaver}
            />

            {/* Google */}
            <img
              src={googleLogo}
              style={{
                width: 46,
                height: 46,
                cursor: "pointer"
              }}
              onClick={loginWithGoogle}
            />

          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              mt:2
            }}
          >
            <Button size="small" sx={{ color: '#9f9f9f' }} 
              onClick={()=>navigate('/member/searchIdPwd')}>
              아이디/비밀번호 찾기
            </Button>
            <Typography variant="body2" color="#d0d0d0">
              |
            </Typography>
            <Button
              size="small"
              sx={{ color: PRIMARY_COLOR, fontWeight: 600 }}
              onClick={() => navigate('/member/join')}
            >
              회원가입
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
export default Login;