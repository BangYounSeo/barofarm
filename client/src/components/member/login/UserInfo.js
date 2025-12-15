import { Box, Button, TextField, Typography } from '@mui/material';
import React from 'react';

const UserInfo = ({form,ok,message,changeInput,PRIMARY_COLOR,sendSms,formatPhone,checkId,verify}) => {
  const {userId,pwd,phone,code,pwdCheck,name,email} = form;
  return (
    <Box>
      {/* 01. 정보입력 섹션 헤더 */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="overline" color="text.secondary">
          STEP 01
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          기본 정보 입력
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          로그인에 사용할 아이디와 비밀번호, 연락처를 입력해 주세요.
        </Typography>
      </Box>

      {/* 아이디 */}
      <Box display="flex" gap={1} alignItems="center">
        <TextField
          label="아이디"
          name="userId"
          size="small"
          value={userId}
          onChange={changeInput}
          onBlur={checkId}
          margin="normal"
          fullWidth
          error={ok.userId === false}
          helperText={message.userId}
          required
        />
      </Box>

      {/* 비밀번호 */}
      <TextField
        fullWidth
        type="password"
        label="비밀번호"
        size="small"
        name="pwd"
        value={pwd}
        onChange={changeInput}
        margin="normal"
        error={ok.pwd === false}
        helperText={message.pwd}
        required
      />

      {/* 비밀번호 확인 */}
      <TextField
        fullWidth
        type="password"
        label="비밀번호 확인"
        size="small"
        name="pwdCheck"
        value={pwdCheck}
        onChange={changeInput}
        margin="normal"
        error={ok.pwdCheck === false}
        helperText={message.pwdCheck}
        required
      />

      {/* 이름 */}
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

      {/* 휴대폰 번호 + 인증발송 */}
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
        <Box display="flex" gap={1} alignItems="flex-start">
          <TextField
            fullWidth
            label="인증 번호"
            name="code"
            size="small"
            value={code}
            onChange={changeInput}
            margin="dense"
            error={ok.code === false}
            helperText={message.code || ""}
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
              alignSelf:'flex-start'
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
        value={email}
        size="small"
        onChange={changeInput}
        error={ok.email===false}
        margin="normal"
        helperText={message.email || "비밀번호를 잊었을 때 임시 비밀번호를 받을 이메일입니다."}
        required
      />
    </Box>
  );
};

export default UserInfo;