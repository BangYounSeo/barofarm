package com.barofarm.barofarm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.Enum.AccountStatus;
import com.barofarm.barofarm.entity.Good;
import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.MemberAddress;

public interface MemberRepository extends JpaRepository<Member, String>{

	Optional<Member> findByUserId(String userId);
	
	Optional<Member> findByPhoneAndName(String phone,String name);
	
	@Query("SELECT g FROM Good g WHERE g.member.userId = :userId AND g.targetType = 'SALES_BOARD' ORDER BY g.goodId DESC")
	List<Good> findAllOfGoodByUserId(@Param("userId") String userId);
	
	@Query("select addr from MemberAddress addr where addr.member.userId = :userId and addr.deleted = 0")
	List<MemberAddress> findAllOfAdrressByUserId(@Param("userId") String userId);

    // status = ACTIVE 인 회원 수
    long countByStatus(AccountStatus status);

	// 🔥 AdminMemberController 에서 사용하는 검색 메소드
    Page<Member> findByUserIdContainingOrNameContaining(String userId, String name, Pageable pageable);

	//AdminService에서 사용(회원정보 검색기능)
	@Query(
		"select m from Member m " +
		"where (" +
		"  :keyword is null or :keyword = '' " +
		"  or lower(m.userId) like lower(concat('%', :keyword, '%')) " +
		"  or lower(m.name)  like lower(concat('%', :keyword, '%')) " +
		"  or lower(m.email) like lower(concat('%', :keyword, '%')) " +
		")"
	)
	Page<Member> searchMembers(@Param("keyword") String keyword, Pageable pageable);
	
	Optional<Member> findByPhone(String phone);
	
	Optional<Member> findByUserIdAndEmail(String userId,String email);

	/**
     * 최근 7일(오늘 포함) 회원가입 수
     * 반환: [0] = java.sql.Date, [1] = CNT(Number)
     */
    @Query(
        value = "SELECT TRUNC(m.CREATED) AS DT, " +
                "       COUNT(*) AS CNT " +
                "FROM MEMBER m " +
                "WHERE m.CREATED >= TRUNC(SYSDATE) - 6 " +
                "GROUP BY TRUNC(m.CREATED) " +
                "ORDER BY DT",
        nativeQuery = true
    )
    List<Object[]> findWeeklySignupStats();
}
