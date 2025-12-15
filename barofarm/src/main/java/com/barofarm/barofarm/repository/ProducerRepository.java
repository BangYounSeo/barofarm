package com.barofarm.barofarm.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.barofarm.barofarm.entity.Producer;

//회원이 등록한 판매자 정보를 가져오는 메소드
public interface ProducerRepository extends JpaRepository<Producer, Long>{
	Producer findByMemberUserId(String userId);

	long countByStatus(String status);

    // 🔥 AdminProducerController 에서 사용하는 메소드
    List<Producer> findByStatus(String status);

    Page<Producer> findByStatus(String status, Pageable pageable);

    Page<Producer> findByFarmNameContainingIgnoreCaseOrMember_UserIdContainingIgnoreCase(
            String farmNameKeyword, String userIdKeyword, Pageable pageable);

    Page<Producer> findByStatusAndFarmNameContainingIgnoreCaseOrMember_UserIdContainingIgnoreCase(
            String status, String farmNameKeyword, String userIdKeyword, Pageable pageable);

    @Query(
        value = "SELECT COUNT(*) FROM PRODUCER WHERE STATUS = 'PENDING'",
        nativeQuery = true
    )
    Long countPendingProducers();
}
