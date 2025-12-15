package com.barofarm.barofarm.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.entity.PurchaseDetail;
import com.barofarm.barofarm.entity.PurchaseGroup;

public interface PurchaseGroupRepository extends JpaRepository<PurchaseGroup, Integer> {

	Page<PurchaseGroup> findByNumPurG(Long numPurG, Pageable pageable);

	Page<PurchaseGroup> findByMember_UserIdContainingIgnoreCase(
			String userId,
			Pageable pageable
	);

	// merchantUid 로 주문 조회 (PG 결제 검증 시 필요)
	Optional<PurchaseGroup> findByMerchantUid(String merchantUid);

	@Query("SELECT DISTINCT pg FROM PurchaseGroup pg JOIN FETCH pg.purchaseDetails pd JOIN FETCH pd.salesBoard sb LEFT JOIN FETCH pg.payment WHERE pg.member.userId = :userId ORDER BY pg.orderDate DESC")
	List<PurchaseGroup> findMyPurchase(@Param("userId") String userId);

	/**
	 * 오늘 날짜의 주문 건수
	 * orderDate (LocalDateTime)를 날짜만 잘라서 오늘과 같은 것만 카운트
	 *
	 * Oracle + Hibernate 기준 TRUNC 함수 사용
	 */
	@Query("SELECT COUNT(pg) " +
			"FROM PurchaseGroup pg " +
			"WHERE FUNCTION('TRUNC', pg.orderDate) = FUNCTION('TRUNC', CURRENT_DATE)")
	long countTodayOrders();

	Page<PurchaseGroup> findByMemberUserIdAndOrderDateBetweenOrderByOrderDateDesc(
			String userId,
			LocalDateTime start,
			LocalDateTime end,
			Pageable pageable);

	Page<PurchaseGroup> findByMemberUserIdOrderByOrderDateDesc(String userId, Pageable pageable);

	long countByMemberUserId(String userId);

	Optional<PurchaseGroup> findByNumPurGAndMemberUserId(int numPurG, String userId);
	
	@Query("SELECT DISTINCT pg FROM PurchaseGroup pg " +
           "JOIN pg.purchaseDetails d " +
           "WHERE d.salesBoard.producer.member.userId = :userId " +
           "AND d.status <> com.barofarm.barofarm.Enum.PurchaseDetailStatus.CANCEL " +
           "AND d.status <> com.barofarm.barofarm.Enum.PurchaseDetailStatus.REFUNDED " +
           "ORDER BY pg.orderDate DESC")
    List<PurchaseGroup> findRecentGroupsForProducer(@Param("userId") String userId, Pageable pageable);

	@Query("SELECT DISTINCT pg FROM PurchaseGroup pg " +
		"JOIN pg.purchaseDetails d " +
		"JOIN d.salesBoard sb " +
		"WHERE LOWER(sb.member.userId) LIKE LOWER(CONCAT('%', :sellerUserId, '%'))")
	Page<PurchaseGroup> findBySellerUserIdContainingIgnoreCase(
			@Param("sellerUserId") String sellerUserId,
			Pageable pageable
	);

    // 관리자 검색용 선택: ALL 검색용 
	@Query("SELECT DISTINCT pg FROM PurchaseGroup pg " +
		"LEFT JOIN pg.purchaseDetails d " +
		"LEFT JOIN d.salesBoard sb " +
		"LEFT JOIN sb.member seller " +
		"WHERE CAST(pg.numPurG AS string) LIKE %:keyword% " +
		"   OR LOWER(pg.member.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
		"   OR LOWER(seller.userId) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	Page<PurchaseGroup> searchByKeyword(
			@Param("keyword") String keyword,
			Pageable pageable
	);

}
