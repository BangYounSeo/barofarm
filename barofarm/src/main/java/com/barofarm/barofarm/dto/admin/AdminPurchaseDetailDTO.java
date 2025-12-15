package com.barofarm.barofarm.dto.admin;

import lombok.Data;

@Data
public class AdminPurchaseDetailDTO {

    private Long numPurD;          // detail pk
    private Long numOptD;          // 옵션 번호
    private Long numBrd;           // 판매글 번호
    private String subject;        // 판매글 제목
    private String optionName;     // 옵션명
    private Integer quantity;      // 수량
    private Integer finalPrice;    // 단품 금액
    private String status;         // PURCHASE_DETAIL_STATUS (NORMAL / CANCEL…)

    // 썸네일 이미지
    private String thumbnail;      // SalesBoard.thumbnail
}
