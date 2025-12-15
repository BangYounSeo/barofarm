package com.barofarm.barofarm.repository;


import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.entity.Review;


//특정 상품에 달린 모든 리뷰를 작성일 기준 최신순으로 가져오는 메소드
public interface ReviewRepository extends JpaRepository<Review, Integer>{

	 // 기존: 이미지 없는 기본 리뷰 조회
	List<Review> findBySalesBoard_NumBrdOrderByCreatedDesc(int numBrd);
	
	//페이징추가
	Page<Review> findBySalesBoard_NumBrdOrderByCreatedDesc(int numBrd, Pageable pageable);
	
	//전체 개수 조회
	long countBySalesBoard_NumBrd(int numBrd);
	
	@Query(value = "SELECT r FROM Review r JOIN FETCH r.member JOIN FETCH r.salesBoard WHERE r.member.userId = :userId ORDER BY r.created DESC",
			  countQuery = "SELECT COUNT(r) FROM Review r WHERE r.member.userId = :userId")
    Page<Review> findPageByUserId(@Param("userId") String userId,Pageable pageable);
	
	@Query("SELECT DISTINCT r FROM Review r " +
		       "LEFT JOIN FETCH r.reviewImages " +
		       "WHERE r.numRev IN :numRevs")
	List<Review> findWithImagesByIdIn(@Param("numRevs") List<Integer> numRevs);

    long countByMemberUserId(String userId);
  
}
