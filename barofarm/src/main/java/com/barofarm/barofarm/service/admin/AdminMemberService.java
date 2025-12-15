package com.barofarm.barofarm.service.admin;

import java.util.function.Function;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

import com.barofarm.barofarm.Enum.AccountStatus;
import com.barofarm.barofarm.Enum.Role;
import com.barofarm.barofarm.dto.admin.AdminMemberDTO;
import com.barofarm.barofarm.dto.admin.AdminMemberUpdateDTO;

@Service
@RequiredArgsConstructor
public class AdminMemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;    

    public Page<AdminMemberDTO> getMembers(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "created"));

        Page<Member> members;

        if (keyword == null || keyword.isEmpty()) {
            members = memberRepository.findAll(pageable);
        } else {
            members = memberRepository.findByUserIdContainingOrNameContaining(keyword, keyword, pageable);
        }

        return members.map(new Function<Member, AdminMemberDTO>() {
            @Override
            public AdminMemberDTO apply(Member m) {
                return toDto(m);
            }
        });
    }

    private AdminMemberDTO toDto(Member m) {
        AdminMemberDTO dto = new AdminMemberDTO();
        dto.setUserId(m.getUserId());
        dto.setPwd(m.getPwd());
        dto.setName(m.getName());
        dto.setPhone(m.getPhone());
        dto.setEmail(m.getEmail());

        // 🔹 Enum -> String (null-safe)
        dto.setRole(m.getRole() != null ? m.getRole().name() : null);
        dto.setUserType(m.getUserType() != null ? m.getUserType().name() : null);
        dto.setStatus(m.getStatus() != null ? m.getStatus().name() : null);

        dto.setCreated(m.getCreated());
        dto.setUpdated(m.getUpdated());
        return dto;
    }

    public void updateMemberDetail(String userId, AdminMemberUpdateDTO dto) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (dto.getName() != null) {
            member.setName(dto.getName());
        }
        if (dto.getPhone() != null) {
            member.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null) {
            member.setEmail(dto.getEmail());
        }

        // 🔹 Role 변경 (값이 들어온 경우에만)
        if (dto.getRole() != null && !dto.getRole().trim().isEmpty()) {
            member.setRole(Role.valueOf(dto.getRole()));
        }

        // 🔹 Status 변경 (값이 들어온 경우에만)
        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            member.setStatus(AccountStatus.valueOf(dto.getStatus()));
        }

        // 🔹 비밀번호 변경 (비어있지 않을 때만)
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            String encoded = passwordEncoder.encode(dto.getPassword());
            member.setPwd(encoded);
        }

        memberRepository.save(member);
    }



}
