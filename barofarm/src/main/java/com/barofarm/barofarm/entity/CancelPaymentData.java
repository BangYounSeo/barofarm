package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import lombok.Data;
@Entity
@Data
public class CancelPaymentData {

    @Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "your_seq")
@SequenceGenerator(name = "your_seq", sequenceName = "YOUR_SEQ", allocationSize = 1)
private Long id;

    // 포트원 결제 고유 ID
    private String paymentId;

    // 주문 번호
    private String merchantId;

    // 결제 금액
    private int amount;

    // 결제 상태 (PAID / FAILED / CANCELLED / READY 등)
    private String status;

    // 결제 수단 (CARD / BANK_TRANSFER / VIRTUAL_ACCOUNT ...)
    private String method;

    // 카드 정보 (옵션)
    private String cardCompany;
    private String cardNumber;

    // 결제 승인 시간
    private LocalDateTime approvedAt;

    // 결제 완료 시간
    private LocalDateTime paidAt;

    // 고객 정보
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // 취소된 금액
    private int cancelledAmount;

    // 남은 금액 (부분취소 시)
    private int balanceAmount;

    // 생성/수정 시간 자동 저장
    private LocalDateTime createdAt = LocalDateTime.now();
    
}
