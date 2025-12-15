package com.barofarm.barofarm.dto.admin;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class AdminPurchaseGroupDTO {

    private Long numPurG;              // 주문번호 (PK)
    private LocalDateTime orderDate;   // 주문일
    private String userId;             // 구매자 ID

    private String receiverName;
    private String receiverPhone;
    private String receiverAddr1;
    private String receiverAddr2;
    private String receiverPostalCode;

    // Payment 정보
    private String paymentStatus;      // PAID / CANCEL / PART_CANCEL …
    private Integer amount;            // 결제 총액
    private LocalDateTime approvedAt;  // 결제 승인 시간 (db 존재)

    // PurchaseDetail 리스트
    private List<AdminPurchaseDetailDTO> details;

    // 부분취소 여부 판단용
    private boolean hasPartialCancel;
}
