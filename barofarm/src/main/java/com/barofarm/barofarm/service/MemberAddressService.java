package com.barofarm.barofarm.service;

import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.MemberAddress;
import com.barofarm.barofarm.repository.MemberAddressRepository;
import com.barofarm.barofarm.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

@Service
@Transactional
public class MemberAddressService {

    private final MemberAddressRepository addressRepository;
    private final MemberRepository memberRepository;

    public MemberAddressService(MemberAddressRepository addressRepository, MemberRepository memberRepository) {
        this.addressRepository = addressRepository;
        this.memberRepository = memberRepository;
    }


    // 새로운 주소 저장
    public MemberAddress saveAddress(String userId, MemberAddress address) {
        System.out.println("[Service] userId: " + userId);
        System.out.println("[Service] address before save: " + address);
        Optional<Member> memberOpt = memberRepository.findByUserId(userId);
        Member member = memberOpt.orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        System.out.println("[Service] found member: " + member);

        address.setMember(member);
        address.setDeleted(0);
        address.setIsDefault(0);
        address.setLastUsedAt(LocalDateTime.now());
        address.setUsedCount(0);

        MemberAddress saved = addressRepository.save(address);
        System.out.println("[Service] saved address: " + saved);

        return saved;
    }

    @Transactional
    public void setDefaultAddress(String userId, Long addressId) {
        // 1. 선택한 주소 외 모든 주소 isDefault = 0
        List<MemberAddress> addresses = addressRepository.findByMemberUserIdAndDeleted(userId, 0);
        for (MemberAddress addr : addresses) {
            addr.setIsDefault(addr.getAddressId().equals(addressId) ? 1 : 0);
        }
        addressRepository.saveAll(addresses);
    }

    @Transactional
    public void deleteAddress(String userId, Integer addressId) {
        MemberAddress addr = addressRepository.findById(addressId.longValue())
        .orElseThrow(() -> new RuntimeException("주소를 찾을 수 없습니다."));
        addr.setDeleted(1);
        addressRepository.save(addr);
    }
}
