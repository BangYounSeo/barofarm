package com.barofarm.barofarm.dto.salesBoard;

import java.time.LocalTime;

import lombok.Data;

@Data
public class ProducerJoinRequest {
	
	private String producerType;
	private String farmName;
	private String ceoName;
	private String bizNo;
	private String openDate;
	private String callCenter;
	private String postalCode;
	private String addr1;
	private String addr2;
	private String bank;
	private String accountNumber;
	private String accountHolder;
	private String settleEmail;
	private String intro;
	private LocalTime startCall;
	private LocalTime endCall;

	private String courier;
	private Integer returnShippingFee;
	private Integer exchangeShippingFee;
	
	
}
