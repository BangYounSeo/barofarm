package com.barofarm.barofarm.dto.member;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ProducerJoinRequest {

	private String producerType;
	
	private String farmName;
	
	private String phone;
	
	private LocalDateTime startCall;
	
	private LocalDateTime endCall;
	
	private String postalCode; //우편번호
	
	private String addr1; // 기본주소
	
	private String addr2; //상세주소
	
	private String intro; //소개글
	
	private String bank;
	
	private String accountNumber;
	
	private String accountHolder;
	
	private String settleEmail;
	
	private String bizNo;
	
	private String ceoName;
	
	private String openDate;
	
	private String courier;
	private Integer returnShippingFee;
	private Integer exchangeShippingFee;
	
}
