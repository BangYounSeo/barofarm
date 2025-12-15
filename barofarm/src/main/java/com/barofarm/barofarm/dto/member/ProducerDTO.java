package com.barofarm.barofarm.dto.member;

import java.time.LocalTime;

import com.barofarm.barofarm.entity.BusinessRegistration;
import com.barofarm.barofarm.entity.Producer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter  
@AllArgsConstructor 
@Builder
public class ProducerDTO {
	
	  	private long proId;          // 판매자 ID
	    private String farmName;    // 농가 이름
	    private String memberUserId; // Member의 userId만 추출
	    private String callCenter; //판매자 전화번호
	    private String postalCode; //우편번호
	    private String addr1; //기본주소
	    private String addr2; //상세주소
	    private String intro; //소개글
	    private String status; // 관리자가 판매자 등록 시 승인,대기
	    private String settleEmail; //이메일

	    
	    private LocalTime startCall;
	    private LocalTime endCall;
	    
	    // 추가: 반품/교환 
	    private String courier;              // 택배사
	    private Integer returnShippingFee;   // 반품 배송비
	    private Integer exchangeShippingFee; // 교환 배송비

	    private String bizNo;   // 사업자번호
	    private String ceoName; // 대표자명
	   //  사업자 정보 전달용
	    
	    
	    //  정산 계좌 정보 
	    private String bank;
	    private String accountNumber;
	    private String accountHolder;
	    
	    /**
	     * Entity → DTO 변환
	     */
	    public static ProducerDTO from(Producer entity) {
	    	
	    	 BusinessRegistration br = entity.getBusinessRegistration();
	    	
	        return ProducerDTO.builder()
	                .proId(entity.getProId())
	                .farmName(entity.getFarmName())
	                .callCenter(entity.getCallCenter())             
	                .postalCode(entity.getPostalCode())
	                .addr1(entity.getAddr1())
	                .addr2(entity.getAddr2())
	                .intro(entity.getIntro())
	                .status(entity.getStatus())
	                .settleEmail(entity.getSettleEmail())
	                .startCall(entity.getStartCall())
	                .endCall(entity.getEndCall())
	                .memberUserId(
	                        entity.getMember() != null
	                                ? entity.getMember().getUserId()
	                                : null
	                )
	                .courier(entity.getCourier())
	                .returnShippingFee(entity.getReturnShippingFee())
	                .exchangeShippingFee(entity.getExchangeShippingFee())
	                
	                .bizNo(br != null ? br.getBizNo() : null)
	                .ceoName(br != null ? br.getCeoName() : null)
	                
	                .bank(entity.getBank())
	                .accountNumber(entity.getAccountNumber())
	                .accountHolder(entity.getAccountHolder())
	                
									.reason(entity.getReason())
	                .build();
	    }

		private final String reason;

}
