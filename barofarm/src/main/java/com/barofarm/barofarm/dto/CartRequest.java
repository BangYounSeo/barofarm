package com.barofarm.barofarm.dto;

import lombok.Data;

@Data
public class CartRequest {
	
	  	private Integer cartId;   // 추가
	 	private String userId;  // 사용자 아이디 (토큰 또는 localStorage에서 가져온 값)
	    private int numBrd;     // 상품 PK
	    private int numOptD;    // 옵션 상세 PK
	    private int quantity;   // 수량
	    
	    private String optionName;   // 옵션명 추가

}
