package com.barofarm.barofarm.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.barofarm.barofarm.entity.ProductItems;

public interface ProductItemRepository extends JpaRepository<ProductItems, Integer>{

	// 대분류 코드로 소분류 목록 가져오기
    List<ProductItems> findByCategoryCode(int categoryCode);
  
    // 검색해서 가져오기
    List<ProductItems> findByItemNameContaining(String item);
}
