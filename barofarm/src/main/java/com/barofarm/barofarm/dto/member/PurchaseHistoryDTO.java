package com.barofarm.barofarm.dto.member;

import java.time.LocalDateTime;
import java.util.List;

import com.barofarm.barofarm.entity.PurchaseGroup;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PurchaseHistoryDTO {

	private final int numPurG;                 // PurchaseGroup PK
    private final String status;               // 주문 상태 (예: PAID, 배송중, 취소 등)
    private final LocalDateTime created;       // 주문 날짜
    private final int totalPrice;              // 총 결제 금액

    private final List<PurchaseItemDTO> items; // 주문 상세 목록
    
    public static PurchaseHistoryDTO from(PurchaseGroup entity, List<PurchaseItemDTO> lists) {
    	return PurchaseHistoryDTO.builder()
    			.numPurG(entity.getNumPurG())
    			.status(entity.getStatus())
    			.created(entity.getOrderDate())
    			.totalPrice(entity.getTotalPrice())
    			.items(lists)
    			.build();
    }
}
