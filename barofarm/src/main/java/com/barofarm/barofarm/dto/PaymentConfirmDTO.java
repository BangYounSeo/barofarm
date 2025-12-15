package com.barofarm.barofarm.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentConfirmDTO {
	
	 	private final String paymentKey;  // PG 결제키
	    private final String orderId;     // merchantUid
	    private final int amount;         // 결제 금액
}
