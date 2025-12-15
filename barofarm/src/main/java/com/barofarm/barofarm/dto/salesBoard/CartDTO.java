package com.barofarm.barofarm.dto.salesBoard;

import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.entity.Cart;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
//장바구니 조회 결과 응답 DTO
public class CartDTO {
	
	private int cartId;
    private int quantity;
    private int unitPriceSnapshot;
    
    private OptionDetailDTO optionDetail;
    private SalesBoardDTO board;

    
    
    public static CartDTO from(Cart entity) {
        return CartDTO.builder()
                .cartId(entity.getCartId())
                .quantity(entity.getQuantity())
                .unitPriceSnapshot(entity.getUnitPriceSnapshot())
                .optionDetail(OptionDetailDTO.from(entity.getSalesOptionDetail()))
                .board(SalesBoardDTO.toDTO(entity.getSalesBoard()))
                .build();
    }


}
