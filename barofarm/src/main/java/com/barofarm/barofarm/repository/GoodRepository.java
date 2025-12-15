package com.barofarm.barofarm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.entity.Good;
import com.barofarm.barofarm.entity.Member;

public interface GoodRepository extends JpaRepository<Good, Integer>{
	
	long countByTargetTypeAndTargetId(String targetType, String targetId);
	
	boolean existsByTargetTypeAndTargetIdAndMember(String targetType,String targetId, Member member);
	
	Optional<Good> findByTargetTypeAndTargetIdAndMember(String targetType, String targetId, Member member);
	
	Good findByMemberAndTargetTypeAndTargetId(Member member, String targetType, String targetId);

	boolean existsByMemberAndTargetTypeAndTargetId(Member member, String targetType, String targetId);

	List<Good> findByMemberAndTargetType(Member member, String targetType);
	
	long countByMemberUserIdAndTargetType(String UserId,String targetType);
	
	void deleteAllByMemberUserId(String userId);

}
