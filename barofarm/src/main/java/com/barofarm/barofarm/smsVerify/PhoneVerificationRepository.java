package com.barofarm.barofarm.smsVerify;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.barofarm.barofarm.entity.PhoneVerification;

public interface PhoneVerificationRepository extends JpaRepository<PhoneVerification, Long>{
	Optional<PhoneVerification> findTopByPhoneOrderByIdDesc(String phone);
}
