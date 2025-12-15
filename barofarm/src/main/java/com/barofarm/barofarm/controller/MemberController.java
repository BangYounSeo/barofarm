package com.barofarm.barofarm.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.barofarm.barofarm.dto.member.JoinResponse;
import com.barofarm.barofarm.dto.member.LoginRequest;
import com.barofarm.barofarm.dto.member.LoginResponse;
import com.barofarm.barofarm.dto.member.SearchIdPwdDTO;
import com.barofarm.barofarm.dto.member.VerifyResponse;
import com.barofarm.barofarm.Enum.AccountStatus;
import com.barofarm.barofarm.dto.member.JoinRequest;
import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.security.JwtTokenProvider;
import com.barofarm.barofarm.service.MemberService;
import com.barofarm.barofarm.smsVerify.PhoneVerificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {
	
	private final MemberService memberService;
	private final PhoneVerificationService phoneVerificationService;

	@PostMapping("/join")
	public ResponseEntity<?> joinMember(@Validated @RequestBody JoinRequest reqDto,
			BindingResult bindingResult) {
		
		if(bindingResult.hasErrors()) {
			return ResponseEntity.badRequest().
					body(bindingResult.getAllErrors());
		}
		
		phoneVerificationService.assertVerified(reqDto.getPhone());
		
		JoinResponse saved = memberService.join(reqDto);
		
		return ResponseEntity.ok(saved);
	}
	
	@PostMapping("/login")
	public ResponseEntity<?> loginUser(@Validated @RequestBody LoginRequest reqDto,
			BindingResult bindingResult){
		
		if(bindingResult.hasErrors()) {
			return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
		}
		
		LoginResponse login = memberService.login(reqDto);
		
		return ResponseEntity.ok(login);
		
	}
	
	@PostMapping("/checkId")
	public ResponseEntity<?> checkId(@Validated @RequestBody LoginRequest req,
			BindingResult bindingResult) {
		
		if(bindingResult.hasErrors()) {
			return ResponseEntity.badRequest()
					.body("아이디 형식이 올바르지 않습니다.");
		}
		
		boolean exist = memberService.checkId(req.getUserId());
		
		if(exist) {
			return ResponseEntity.status(HttpStatus.CONFLICT)
					.body("이미 사용 중인 아이디입니다.");
		}
		
		return ResponseEntity.ok("사용 가능한 아이디입니다.");
	}
	
	@PostMapping("/send-code")
    public ResponseEntity<String> sendCode(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        phoneVerificationService.sendCode(phone);
        return ResponseEntity.ok("인증번호가 전송되었습니다.");
    }

    @PostMapping("/verify")
    public ResponseEntity<VerifyResponse> verify(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String code = body.get("code");

		phoneVerificationService.verifyCode(phone, code);
	    return ResponseEntity.ok(
	    		new VerifyResponse(true,"휴대폰 인증이 완료되었습니다."));

    }
    
    @PostMapping("/searchId")
	public ResponseEntity<?> searchId(@Validated @RequestBody SearchIdPwdDTO req,
			BindingResult bindingResult) {
		
		if(bindingResult.hasErrors()) {
			return ResponseEntity.badRequest()
					.body("입력값이 올바르지 않습니다.");
		}
		
		phoneVerificationService.assertVerified(req.getPhone());
		
		SearchIdPwdDTO exist = memberService.searchIdByPhone(req);
		
		return ResponseEntity.ok(exist);
	}
    
    @PostMapping("/searchPwd")
    public ResponseEntity<?> searchPwd(@Validated @RequestBody SearchIdPwdDTO req,
    		BindingResult bindingResult) {
    	
    	if(bindingResult.hasErrors()) {
			return ResponseEntity.badRequest()
					.body("입력값이 올바르지 않습니다.");
		}
		
		phoneVerificationService.assertVerified(req.getPhone());
		
		memberService.searchId(req);
		
		memberService.resetPassword(req);
		
		return ResponseEntity.ok("임시 비밀번호가 이메일로 발송되었습니다.");
	}
    
}
