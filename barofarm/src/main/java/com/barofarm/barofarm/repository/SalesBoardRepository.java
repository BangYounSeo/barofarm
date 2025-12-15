package com.barofarm.barofarm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.entity.SalesBoard;

public interface SalesBoardRepository extends JpaRepository<SalesBoard, Integer>{
	
	//상태가 common 인 상품 리스트
	List<SalesBoard> findByStatus(String status);

	Optional <SalesBoard> findByNumBrd(int numbrd);

	//productType(품목) + status 필터링
	List<SalesBoard> findByProductTypeAndStatus(String productType, String status);
	
	//제목으로 검색 + 상태
	List<SalesBoard> findBySubjectContainingAndStatus(String keyword, String status);
	
	//품목 + 제목 + 상태 검색
	List<SalesBoard> findByProductTypeAndSubjectContainingAndStatus(
	        String productType, String keyword, String status
	);
	
	//productItem(소분류) + status
	List<SalesBoard> findByProductItemAndStatus(int productItem, String status);

	//productType(대분류) + productItem(소분류) + status
	List<SalesBoard> findByProductTypeAndProductItemAndStatus(
					String productType, int productItem, String status
	);
	
	 // 페이징 지원 버전 (Pageable)
    Page<SalesBoard> findByStatusIn(List<String> statusList, Pageable pageable);
    Page<SalesBoard> findByProductTypeAndStatusIn(String productType, List<String> statusList, Pageable pageable);
    Page<SalesBoard> findByProductItemAndStatusIn(Integer productItem, List<String> statusList, Pageable pageable);
    Page<SalesBoard> findBySubjectContainingAndStatusIn(String keyword, List<String> statusList, Pageable pageable);
    Page<SalesBoard> findByProductTypeAndSubjectContainingAndStatusIn(
        String productType, String keyword, List<String> statusList, Pageable pageable
    );
    Page<SalesBoard> findByProductTypeAndProductItemAndStatusIn(
        String productType, Integer productItem, List<String> statusList, Pageable pageable
    );
    
 // ===========================
    // 🔥 품절상품 뒤로 보내는 정렬 기반 페이징 (JDK8 호환 JPQL)
    // ===========================

    @Query("SELECT sb FROM SalesBoard sb " +
            "WHERE sb.status IN :statusList " +
            "ORDER BY " +
            "CASE WHEN sb.stock > 0 AND sb.status = 'common' THEN 0 ELSE 1 END, " +
            "sb.created DESC")
    Page<SalesBoard> findAllSorted(@Param("statusList") List<String> statusList, Pageable pageable);

    @Query("SELECT sb FROM SalesBoard sb " +
            "WHERE sb.status IN :statusList AND sb.productType = :productType " +
            "ORDER BY " +
            "CASE WHEN sb.stock > 0 AND sb.status = 'common' THEN 0 ELSE 1 END, " +
            "sb.created DESC")
    Page<SalesBoard> findByProductTypeSorted(
            @Param("productType") String productType,
            @Param("statusList") List<String> statusList,
            Pageable pageable);

    @Query("SELECT sb FROM SalesBoard sb " +
            "WHERE sb.status IN :statusList AND sb.productItem = :productItem " +
            "ORDER BY " +
            "CASE WHEN sb.stock > 0 AND sb.status = 'common' THEN 0 ELSE 1 END, " +
            "sb.created DESC")
    Page<SalesBoard> findByProductItemSorted(
            @Param("productItem") Integer productItem,
            @Param("statusList") List<String> statusList,
            Pageable pageable);

    @Query("SELECT sb FROM SalesBoard sb " +
            "WHERE sb.status IN :statusList AND sb.subject LIKE %:keyword% " +
            "ORDER BY " +
            "CASE WHEN sb.stock > 0 AND sb.status = 'common' THEN 0 ELSE 1 END, " +
            "sb.created DESC")
    Page<SalesBoard> findByKeywordSorted(
            @Param("keyword") String keyword,
            @Param("statusList") List<String> statusList,
            Pageable pageable);

    @Query("SELECT sb FROM SalesBoard sb " +
            "WHERE sb.status IN :statusList AND sb.productType = :productType AND sb.subject LIKE %:keyword% " +
            "ORDER BY " +
            "CASE WHEN sb.stock > 0 AND sb.status = 'common' THEN 0 ELSE 1 END, " +
            "sb.created DESC")
    Page<SalesBoard> findByProductTypeAndKeywordSorted(
            @Param("productType") String productType,
            @Param("keyword") String keyword,
            @Param("statusList") List<String> statusList,
            Pageable pageable);

    @Query("SELECT sb FROM SalesBoard sb " +
            "WHERE sb.status IN :statusList AND sb.productType = :productType AND sb.productItem = :productItem " +
            "ORDER BY " +
            "CASE WHEN sb.stock > 0 AND sb.status = 'common' THEN 0 ELSE 1 END, " +
            "sb.created DESC")
    Page<SalesBoard> findByProductTypeAndProductItemSorted(
            @Param("productType") String productType,
            @Param("productItem") Integer productItem,
            @Param("statusList") List<String> statusList,
            Pageable pageable);

	
	//내가 작성한 판매글
	@Query("SELECT sb FROM SalesBoard sb WHERE sb.member.userId = :userId ORDER BY sb.created DESC")
	List<SalesBoard> findAllByUserId(@Param("userId") String userId);
	
	//판매상태 변경
	List<SalesBoard> findByStatusIn(List<String> statusList);
    List<SalesBoard> findByProductTypeAndStatusIn(String productType, List<String> statusList);
    List<SalesBoard> findByProductItemAndStatusIn(Integer productItem, List<String> statusList);
    List<SalesBoard> findBySubjectContainingAndStatusIn(String keyword, List<String> statusList);
    List<SalesBoard> findByProductTypeAndSubjectContainingAndStatusIn(
            String productType,
            String keyword,
            List<String> statusList
    );

    List<SalesBoard> findByProductTypeAndProductItemAndStatusIn(
            String productType,
            Integer productItem,
            List<String> statusList
    );
    

 // 📌 주문량 높은 순 TOP 4 (Oracle)
    @Query(
    	    value =
    	        "SELECT * FROM ( " +
    	        "   SELECT sb.*, " +
    	        "          (SELECT NVL(SUM(pd.QUANTITY), 0) " +
    	        "           FROM PURCHASE_DETAIL pd " +
    	        "           WHERE pd.NUM_BRD = sb.NUM_BRD AND pd.STATUS = 'COMPLETE') AS CNT " +
    	        "   FROM SALES_BOARD sb " +
    	        "   WHERE sb.STATUS = 'common' " +
    	        "   ORDER BY CNT DESC " +
    	        ") " +
    	        "WHERE ROWNUM <= 4",
    	    nativeQuery = true
    	)
    	List<SalesBoard> findBestProducts();


    // 📌 최신 등록순 TOP 4
    List<SalesBoard> findTop4ByStatusOrderByCreatedDesc(String status);
    
    // HIT_COUNT 높은 순 TOP 7
    List<SalesBoard> findTop7ByStatusOrderByHitCountDesc(String status);
	
	@Query(value = "SELECT COUNT(*) FROM SALES_BOARD", nativeQuery = true)
    Long countAllProducts();
	
	Page<SalesBoard> findByProducer_Member_UserId(String userId,Pageable pageable);
}
