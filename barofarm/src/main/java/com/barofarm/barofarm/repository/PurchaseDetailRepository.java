package com.barofarm.barofarm.repository;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.Enum.PurchaseDetailStatus;
import com.barofarm.barofarm.entity.PurchaseDetail;

public interface PurchaseDetailRepository extends JpaRepository<PurchaseDetail, Integer>{

	Page<PurchaseDetail> findBySalesBoard_Member_userId(String userId,Pageable pageable);
	
	List<PurchaseDetail> findByStatusAndShippingStartedAtBefore(PurchaseDetailStatus status,LocalDateTime dateTime);
	
	List<PurchaseDetail> findByPurchaseGroupNumPurG(int numPurG);
	
	List<PurchaseDetail> findByStatusAndShippingCompletedAtBeforeAndHoldReleasedFalse(PurchaseDetailStatus status,LocalDateTime completeBefore);
	
	@Query("SELECT pd FROM PurchaseDetail pd " + 
			"WHERE pd.status = :status " + 
			"AND pd.holdReleased = true " + 
			"AND pd.shippingCompletedAt BETWEEN :from AND :to " +
			"AND NOT EXISTS (" + 
			"SELECT 1 FROM SettlementDetail sd " + 
			"WHERE sd.purchaseDetail = pd)")
	List<PurchaseDetail> findSettlementTargets(@Param("status") PurchaseDetailStatus status, @Param("from") LocalDateTime from,@Param("to") LocalDateTime to);
	
	// 오늘 주문수 (취소/환불 제외, 상세 기준으로 카운트)
	@Query("SELECT COUNT(DISTINCT pg) FROM PurchaseDetail d " + 
		   "JOIN d.purchaseGroup pg " +
	       "WHERE d.salesBoard.producer.member.userId = :userId " +
	       "AND TRUNC(pg.orderDate) = TRUNC(SYSDATE) " +
	       "AND d.status <> com.barofarm.barofarm.Enum.PurchaseDetailStatus.CANCEL " +
	       "AND d.status <> com.barofarm.barofarm.Enum.PurchaseDetailStatus.REFUNDED")
	int countTodayOrders(@Param("userId") String userId);

	// 오늘 매출 (취소/환불 제외, finalPrice 합계)
	@Query("SELECT COALESCE(SUM(d.finalPrice), 0) " +
	       "FROM PurchaseDetail d WHERE d.salesBoard.producer.member.userId = :userId " +
	       "AND TRUNC(d.purchaseGroup.orderDate) = TRUNC(SYSDATE) " +
	       "AND d.status <> com.barofarm.barofarm.Enum.PurchaseDetailStatus.CANCEL " +
	       "AND d.status <> com.barofarm.barofarm.Enum.PurchaseDetailStatus.REFUNDED")
	int sumTodaySales(@Param("userId") String userId);
	
	
	@Query("SELECT COUNT(DISTINCT pg) FROM PurchaseDetail d " +
		   "JOIN d.purchaseGroup pg " +
	       "WHERE d.salesBoard.producer.member.userId = :userId " +
	       "AND TRUNC(pg.orderDate) = TRUNC(SYSDATE - 1) " +
	       "AND d.status <> com.barofarm.barofarm.Enum.PurchaseDetailStatus.CANCEL " +
	       "AND d.status <> com.barofarm.barofarm.Enum.PurchaseDetailStatus.REFUNDED")
	int countYesterdayOrders(@Param("userId") String userId);

	@Query("SELECT COALESCE(SUM(d.finalPrice), 0) " +
	       "FROM PurchaseDetail d " +
	       "WHERE d.salesBoard.producer.member.userId = :userId " +
	       "AND TRUNC(d.purchaseGroup.orderDate) = TRUNC(SYSDATE - 1) " +
	       "AND d.status <> com.barofarm.barofarm.Enum.PurchaseDetailStatus.CANCEL " +
	       "AND d.status <> com.barofarm.barofarm.Enum.PurchaseDetailStatus.REFUNDED")
	int sumYesterdaySales(@Param("userId") String userId);
	
	// 정산 예정 금액(전체, 이번 주 표시는 프론트에서 "이번 주 예정"이라고만 써도 됨)
	@Query("SELECT COALESCE(SUM(d.finalPrice), 0) " +
	       "FROM PurchaseDetail d " +
	       "WHERE d.salesBoard.producer.member.userId = :userId " +
	       "AND d.status = :status " +
	       "AND d.holdReleased = true " +                  // 홀드 기간 지난 것만
	       "AND d.shippingCompletedAt BETWEEN :from AND :to")
	int sumExpectedSettlementForRange(
		@Param("status") PurchaseDetailStatus status,
        @Param("userId") String userId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to);
	
	@Query("SELECT COUNT(DISTINCT pg) FROM PurchaseDetail d " + 
		   "JOIN d.purchaseGroup pg " +
	       "WHERE d.salesBoard.producer.member.userId = :userId " +
	       "AND d.status = com.barofarm.barofarm.Enum.PurchaseDetailStatus.READYSHIP")
	int countReadyShip(@Param("userId") String userId);

	/**
     * 제일 많이 산 제품 TOP5
     * 반환: [0]=NUM_BRD, [1]=SUBJECT, [2]=USER_ID, [3]=PRICE, [4]=TOTAL_QTY
     */
    @Query(
        value =
            "SELECT * FROM ( " +
            "  SELECT sb.NUM_BRD AS NUM_BRD, " +
            "         sb.SUBJECT AS SUBJECT, " +
            "         sb.USER_ID AS USER_ID, " +
            "         sb.PRICE AS PRICE, " +
            "         SUM(pd.QUANTITY) AS TOTAL_QTY " +
            "  FROM PURCHASE_DETAIL pd " +
            "  JOIN SALES_BOARD sb ON pd.NUM_BRD = sb.NUM_BRD " +
            "  GROUP BY sb.NUM_BRD, sb.SUBJECT, sb.USER_ID, sb.PRICE " +
            "  ORDER BY TOTAL_QTY DESC " +
            ") t " +
            "WHERE ROWNUM <= 5",
        nativeQuery = true
    )
    List<Object[]> findBestSellerTop5();

	 List<PurchaseDetail> findAllByPurchaseGroup_NumPurG(int numPurG);

	 PurchaseDetail findByNumPurD(int numPurD);
	 
}
