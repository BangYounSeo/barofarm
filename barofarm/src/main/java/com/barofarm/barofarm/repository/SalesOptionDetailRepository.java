package com.barofarm.barofarm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.barofarm.barofarm.entity.SalesOptionDetail;

public interface SalesOptionDetailRepository extends JpaRepository<SalesOptionDetail, Integer>{
	
	//옵션 그룹 번호(numOptG) 기준으로 옵션 상세 리스트 조회
	List<SalesOptionDetail> findBySalesOptionGroupNumOptG(int numOptG);
	

    // ⭐ 추가: 상품 기준 조회
	List<SalesOptionDetail> findBySalesOptionGroup_SalesBoard_NumBrd(int numBrd);

	Optional <SalesOptionDetail> findByNumOptD(int numOptD);
}