package com.barofarm.barofarm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.barofarm.barofarm.dto.AddressOnly;
import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.MemberAddress;

public interface MemberAddressRepository extends JpaRepository<MemberAddress, Long>{

	@Query("select addr from MemberAddress addr where addr.member.userId = :userId and addr.deleted = 0")
	List<MemberAddress> findAllOfAdrressByUserId(@Param("userId") String userId);
	
	long countByMemberUserId(String userId);
	
	@Modifying
	@Query("update MemberAddress a set a.isDefault = 0 where a.member.userId = :userId and a.isDefault = 1")
	void updateAllIsDefaultToZeroByMember(@Param("userId") String userId);
	
	Optional<MemberAddress> findByAddressIdAndMemberUserId(Long addressId, String userId);
	
	void deleteAllByMember(Member member);

	 List<MemberAddress> findByMember_UserIdOrderByIsDefaultAscLastUsedAtDesc(String userId);
// userId 조건으로 주소만 가져오기
    @Query("SELECT new com.barofarm.barofarm.dto.AddressOnly(a.addressId, a.alias, a.receiver, a.phone, a.postalCode, a.addr1, a.addr2, a.deleted, a.isDefault) " +
           "FROM MemberAddress a WHERE a.member.userId = :userId")
    List<AddressOnly> findAddressOnlyByUserId(@Param("userId") String userId);

    List<MemberAddress> findByMemberUserIdAndDeleted(String userId, int deleted);
}