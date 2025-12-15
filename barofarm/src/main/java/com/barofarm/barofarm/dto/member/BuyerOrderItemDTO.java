package com.barofarm.barofarm.dto.member;


import com.barofarm.barofarm.dto.salesBoard.OptionDetailDTO;
import com.barofarm.barofarm.entity.PurchaseDetail;
import com.barofarm.barofarm.entity.SalesBoard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BuyerOrderItemDTO {

    private final int numPurD;
    private final int quantity;
    private final int price;          // 단가 (finalPrice)
    private final int linePrice;      // price * quantity

    private final int numBrd;
    private final String subject;
    private final String thumbnail;
    private final String status;
    private OptionDetailDTO option;
    private final boolean reviewed;   // 리뷰 작성 여부

    public static BuyerOrderItemDTO from(PurchaseDetail d) {
        SalesBoard board = d.getSalesBoard();

        return BuyerOrderItemDTO.builder()
                .numPurD(d.getNumPurD())
                .quantity(d.getQuantity())
                .price(d.getUnitPrice())
                .linePrice(d.getFinalPrice())
                .numBrd(board.getNumBrd())
                .subject(board.getSubject())
                .thumbnail(board.getThumbnail()) // 엔티티에 썸네일 필드 있다면
                .status(d.getStatus()!=null ? d.getStatus().name() : null)
                .reviewed(d.getReview() != null)
                .option(OptionDetailDTO.from(d.getSalesOptionDetail()))
                .build();
    }
}

