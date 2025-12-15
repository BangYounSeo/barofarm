package com.barofarm.barofarm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.entity.Cart;

public interface CartRepository  extends JpaRepository<Cart, Integer>{
	

    // 기존 (일반 조회)
    List<Cart> findByMember_UserId(String userId);

    // ⭐ JOIN FETCH 추가 (옵션/상품 정보까지 한번에 가져오기)
    @Query("SELECT c FROM Cart c " +
            "JOIN FETCH c.salesBoard sb " +
            "JOIN FETCH c.salesOptionDetail od " +
            "WHERE c.member.userId = :userId")
    List<Cart> findCartWithOptionByUserId(@Param("userId") String userId);

    // 선택 삭제
    void deleteAllByCartIdIn(List<Integer> cartIds);
    
    // ⭐ 장바구니 전체 삭제 추가
    void deleteAllByMember_UserId(String userId);
    //동일 상품 및 옵션 수량 처리 
    Cart findByMember_UserIdAndSalesOptionDetail_NumOptD(String userId, int numOptD);

    void deleteByMember_UserIdAndSalesOptionDetail_NumOptD(String userId, int numOptD);

	
}
