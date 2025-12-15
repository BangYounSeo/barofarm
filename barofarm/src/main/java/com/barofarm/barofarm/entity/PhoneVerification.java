package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class PhoneVerification {

	@Id
	@GeneratedValue
	private Long id;
	
	private String phone;
	private String code;
	private LocalDateTime expiresAt;
	private boolean verified;
}
