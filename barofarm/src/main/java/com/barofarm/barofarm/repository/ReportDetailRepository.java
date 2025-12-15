package com.barofarm.barofarm.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.ReportDetail;

public interface ReportDetailRepository extends JpaRepository<ReportDetail, Integer>{
	
	boolean existsByTargetTypeAndTargetIdAndMember(String targetType, String targetId, Member member);

    // status = 'ready' 같은 상태별 신고 카운트
    long countByStatus(String status);

    // ✅ 관리자용 검색 (상태 + 유저명/신고내용)
    @Query("SELECT rd " +
           "FROM ReportDetail rd " +
           "JOIN rd.member m " +
           "WHERE (:status IS NULL OR rd.status = :status) " +
           "  AND (" +
           "       :keyword IS NULL " +
           "       OR LOWER(m.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "       OR LOWER(rd.reason) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
           "      ) " +
           "ORDER BY rd.created DESC")
    Page<ReportDetail> searchForAdmin(@Param("status") String status,
                                      @Param("keyword") String keyword,
                                      Pageable pageable);

       @Query(
       value = "SELECT COUNT(*) FROM REPORT_DETAIL WHERE STATUS = 'READY'",
       nativeQuery = true
       )
        Long countPendingReports();                                 
                                      
}
