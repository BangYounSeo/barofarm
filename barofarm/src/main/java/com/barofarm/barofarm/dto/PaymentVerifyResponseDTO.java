package com.barofarm.barofarm.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentVerifyResponseDTO {

    private String paymentId;       // 결제 ID
    private String status;          // 결제 상태
    private int amount;             // 결제 금액
    private String currency;        // 통화
    private String receiptUrl;      // 영수증 URL
    private LocalDateTime approvedAt;      // 결제 완료 시각
    private String method;          // 결제 수단
    private String transactionId;   // PG사 거래 ID
    private String orderId;      // 고유주문번호

    private CustomerInfo customer;  // 고객 정보
    private CardInfo card;          // 카드 결제 정보

    @Getter
    @Builder
    public static class CustomerInfo {
        private String name;
        private String email;
        private String phone;
    }

    @Getter
    @Builder
    public static class CardInfo {
        private String number;
        private String issuer;
        private int installments;
        private boolean isInterestFree;
        private String approvedAt;
    }
}

