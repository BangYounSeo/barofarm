package com.barofarm.barofarm.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.entity.Settlement;

public interface SettlementRepository extends JpaRepository<Settlement, Long>{

	List<Settlement> findByProducer_Member_UserIdAndCompletedAtBetweenOrderByCompletedAtDesc(String userId,LocalDateTime start,LocalDateTime end);
	
	// ✅ 이번 달 정산 합계 (scheduleDate 기준)
	@Query("select coalesce(sum(s.totalAmount), 0) " +
           "from Settlement s " +
           "where s.producer.member.userId = :userId " +
           "and s.scheduleDate between :start and :end")
    int sumMonthlySales(
            @Param("userId") String userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
    
    @Query("select coalesce(sum(s.settlementAmount), 0) " +
            "from Settlement s " +
            "where s.producer.member.userId = :userId " +
            "and s.periodStart between :start and :end " +
            "and s.status = :status")
     int sumSettlementByPeriodAndStatus(
             @Param("userId") String userId,
             @Param("start") LocalDate start,
             @Param("end") LocalDate end,
             @Param("status") String status
     );
    
    // ✅ 누적 정산 금액
    @Query("select coalesce(sum(s.settlementAmount), 0) " +
           "from Settlement s " +
           "where s.producer.member.userId = :userId")
    int sumTotalSettlement(@Param("userId") String userId);
}
