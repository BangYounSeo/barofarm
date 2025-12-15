package com.barofarm.barofarm.dto.admin;


import lombok.Data;

@Data
public class AdminPurchaseSummaryDTO {

    private Long numPurG;              // 주문번호
    private java.time.LocalDateTime orderDate;
    private String userId;             // 구매자 ID

    private String receiverName;
    private String receiverPhone;
    private String receiverAddr1;
    private String receiverAddr2;

    private Integer totalPrice;
    private String paymentStatus;

    private boolean hasPartialCancel;

    // 🔥 추가: 대표 판매자 이름 (또는 아이디)
    private String sellerName;
}