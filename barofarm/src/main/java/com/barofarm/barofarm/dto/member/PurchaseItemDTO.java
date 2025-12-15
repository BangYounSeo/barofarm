package com.barofarm.barofarm.dto.member;

import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.salesBoard.OptionDetailDTO;
import com.barofarm.barofarm.entity.PurchaseDetail;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PurchaseItemDTO {
	
	private final int numPurD; // PurchaseDetail PK
	private final int price; // 구매 가격
	private final int quantity; // 수량
	private final String status;
	private final SalesBoardDTO board;
	private final OptionDetailDTO option;

	public static PurchaseItemDTO from(PurchaseDetail entity) {
		return PurchaseItemDTO.builder()
				.numPurD(entity.getNumPurD())
				.price(entity.getFinalPrice())
				.quantity(entity.getQuantity())
				.board(SalesBoardDTO.toDTO(entity.getSalesBoard()))
				.option(OptionDetailDTO.from(entity.getSalesOptionDetail()))
				.status(entity.getStatus()!=null 
					? entity.getStatus().name() : null)
				.build();
	}

}
