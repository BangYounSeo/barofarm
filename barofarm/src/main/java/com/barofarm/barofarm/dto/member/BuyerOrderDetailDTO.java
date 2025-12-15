package com.barofarm.barofarm.dto.member;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.barofarm.barofarm.entity.PurchaseGroup;
import com.barofarm.barofarm.entity.PurchaseDetail;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BuyerOrderDetailDTO {

    // 주문 그룹 기본 정보
    private final int numPurG;
    private final String status;            // PAID, SHIPPING, COMPLETE ...
    private final LocalDateTime orderDate;  // 주문일자
    private final int totalPrice;           // 총 결제금액

    // 배송/수령인 정보 (필드 이름은 실제 엔티티에 맞게 수정)
    private final String receiverName;
    private final String receiverPhone;
    private final String postalCode;
    private final String addr1;
    private final String addr2;

    // 결제 정보 요약 (Payment 엔티티에서 가져올 것)
    private final String paymentMethod;     // CARD, VBANK, KAKAOPAY ...
    private final String paymentProvider;   // PG사, 카드사
    private final String paymentTid;        // 거래 ID
    private final LocalDateTime paidAt;     // 결제 완료 시간

    // 주문 상세 리스트
    private final List<BuyerOrderItemDTO> items;

    public static BuyerOrderDetailDTO from(PurchaseGroup pg) {
        return BuyerOrderDetailDTO.builder()
                .numPurG(pg.getNumPurG())
                .status(pg.getStatus())
                .orderDate(pg.getOrderDate())          // 이름 다르면 수정
                .totalPrice(pg.getTotalPrice())
                .receiverName(pg.getReceiverName())    // 엔티티에 맞게 수정
                .receiverPhone(pg.getReceiverPhone())
                .postalCode(pg.getReceiverPostalCode())
                .addr1(pg.getReceiverAddr1())
                .addr2(pg.getReceiverAddr2())
                .paymentMethod(
                        pg.getPayment() != null ? pg.getPayment().getMethod() : null
                )
                .paymentTid(
                        pg.getPayment() != null ? pg.getPayment().getPaymentId() : null
                )
                .paidAt(
                        pg.getPayment() != null ? pg.getPayment().getApprovedAt() : null
                )
                .items(
                        pg.getPurchaseDetails().stream()
                                .map(BuyerOrderItemDTO::from)
                                .collect(Collectors.toList())
                )
                .build();
    }
}
