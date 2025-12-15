package com.barofarm.barofarm.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.entity.Payment;
import com.barofarm.barofarm.entity.QnaBoard;

public interface QnaBoardRepository extends JpaRepository<QnaBoard, Integer>{
	
	List<QnaBoard> findBySalesBoard_NumBrdOrderByCreatedDesc(int numBrd);
	
	@Query("SELECT q FROM QnaBoard q JOIN FETCH q.member WHERE q.member.userId = :userId ORDER BY q.created DESC")
	List<QnaBoard> findAllByUserId(@Param("userId") String userId);


    // status = 'ready' 같은 상태별 문의 카운트
    long countByStatus(String status);

	 Page<QnaBoard> findByStatus(String status, Pageable pageable);
	long countByMemberUserId(String userId);
}
