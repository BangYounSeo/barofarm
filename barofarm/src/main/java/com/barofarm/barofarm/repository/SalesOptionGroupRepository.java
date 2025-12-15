package com.barofarm.barofarm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.barofarm.barofarm.entity.SalesOptionGroup;

//특정상품의 PK(numBrd)를 기준으로 해당 상품에 속한 모든 데이터를 가죠옴
public interface SalesOptionGroupRepository extends JpaRepository<SalesOptionGroup, Integer> {
	List<SalesOptionGroup> findBySalesBoardNumBrd(int numBrd);
}
