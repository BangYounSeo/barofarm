package com.barofarm.barofarm.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.barofarm.barofarm.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, String> {

    // 🔥 AdminPaymentController 에서 사용하는 상태별 페이징 조회
    Page<Payment> findByStatus(String status, Pageable pageable);

    /**
     * 오늘 결제 완료된 주문의 매출 합계
     * - PurchaseGroup.totalPrice 합계를 기준으로 집계
     * - Payment ↔ PurchaseGroup 는 @OneToOne 연관관계
     */
    @Query("SELECT COALESCE(SUM(pg.totalPrice), 0) " +
           "FROM Payment p " +
           "JOIN p.purchaseGroup pg " +
           "WHERE pg.paidAt IS NOT NULL " +
           "AND FUNCTION('TRUNC', pg.paidAt) = FUNCTION('TRUNC', CURRENT_DATE)")
    Long sumTodayPayments();
    
    Payment findByPurchaseGroupNumPurG(int numPurG);

    @Query("SELECT p FROM Payment p WHERE p.purchaseGroup.numPurG = :numPurG")
    java.util.Optional<Payment> findByNumPurG(@org.springframework.data.repository.query.Param("numPurG") int numPurG);
}
