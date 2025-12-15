package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

import org.hibernate.annotations.Type;

import lombok.Getter;
import lombok.Setter;

@Entity  // JPA 엔티티임을 표시. 이 클래스는 DB 테이블과 매핑됨
@Getter
@Setter
public class Payment {
	
	@Id  // PK(primary key) 컬럼임을 표시
	@Column(name="paymentId")  // DB 컬럼명을 "paymentId"로 지정
	private String paymentId; // 결제 ID, PortOne에서 발급된 결제 고유 ID
	
	private String status; // 결제 상태 (PAID, FAILED 등)
    private int amount; // 결제 금액
    private String currency; // 통화 단위 (KRW 등)
    private String receiptUrl; // 영수증 URL
    private LocalDateTime approvedAt; // 결제 완료 시각, LocalDateTime 타입으로 저장
    private String method; // 결제 수단 (CARD, VBANK, TRANSFER 등)
    private String transactionId; // PG사 거래 ID (포트원 내부 거래 ID)

    // CustomerInfo 분해: 고객 정보를 객체가 아니라 컬럼으로 나눠서 저장
    private String customerName; // 고객 이름
    private String customerEmail; // 고객 이메일
    private String customerPhone; // 고객 전화번호

    // CardInfo 분해: 카드 결제 관련 정보
    private String cardNumber; // 카드 번호 (일부 마스킹 처리 가능)
    private String cardIssuer; // 카드 발급사 이름 (KB, 삼성 등)
    private int cardInstallments; // 할부 개월 수

    @Column(name = "CARD_IS_INTEREST_FREE")
    @Type(type = "org.hibernate.type.NumericBooleanType") 
    private boolean cardIsInterestFree; // 무이자 할부 여부
    private String cardApprovedAt; // 카드 승인 시각

    // 결제와 관련된 구매 그룹(PurchaseGroup) 매핑
    @OneToOne(fetch = FetchType.LAZY) // 1:1 관계, 지연로딩(LAZY)
    @JoinColumn(name="numPurG") // FK 컬럼명을 "numPurG"로 지정
    private PurchaseGroup purchaseGroup; // 연관된 구매 그룹 엔티티
}
