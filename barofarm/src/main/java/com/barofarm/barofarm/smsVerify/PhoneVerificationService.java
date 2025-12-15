package com.barofarm.barofarm.smsVerify;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.barofarm.barofarm.entity.PhoneVerification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PhoneVerificationService {
	
	private final PhoneVerificationRepository repo;
    private final SolapiSmsService smsService;

    public void sendCode(String phone) {
        String code = String.format("%06d", (int)(Math.random() * 1000000));
        
        PhoneVerification last = repo.findTopByPhoneOrderByIdDesc(phone)
                .orElse(null);

        PhoneVerification pv = new PhoneVerification();
        pv.setPhone(phone);
        pv.setCode(code);
        pv.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        pv.setVerified(false);
        repo.save(pv);

        String msg = "[바로팜] 인증번호는 " + code + " 입니다. 5분 내 입력해 주세요.";
        smsService.sendSms(phone, msg);  // 🔥 Solapi로 문자 발송
    }
    
    public void verifyCode(String phone, String code) {
        PhoneVerification pv = repo.findTopByPhoneOrderByIdDesc(phone)
            .orElseThrow(() -> 
            	new ResponseStatusException(
                        HttpStatus.NOT_FOUND,"인증 요청을 먼저 진행해 주세요."));

        if (pv.isVerified()) {
        	throw new ResponseStatusException(HttpStatus.CONFLICT,"이미 인증이 완료된 번호입니다.");
        }

        if (pv.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,"인증번호가 만료되었습니다. 다시 인증을 진행해 주세요.");
        }

        if (!pv.getCode().equals(code)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,"인증번호가 일치하지 않습니다.");
        }

        pv.setVerified(true);
        repo.save(pv);
    }
    
    public void assertVerified(String phone) {
    	PhoneVerification pv = repo.findTopByPhoneOrderByIdDesc(phone)
    	        .orElseThrow(() -> new ResponseStatusException(
    	                HttpStatus.NOT_FOUND,
    	                "휴대폰 인증 정보가 없습니다. 인증 요청을 먼저 진행해 주세요."
    	        ));

	    if (!pv.isVerified()) {
	        throw new ResponseStatusException(
	                HttpStatus.CONFLICT,
	                "휴대폰 인증이 완료되지 않았습니다."
	        );
	    }
    }
}
