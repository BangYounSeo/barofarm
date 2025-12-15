package com.barofarm.barofarm.dto;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderResponseDTO {
	
	 	private final String orderId;       // merchantUid
	    private final int amount;           // 총 결제 금액
	    private final String orderName;     // 주문명
	    private final String customerName;  // 고객명(배송자 이름 포함)

}
