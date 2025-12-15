package com.barofarm.barofarm.controller.admin;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import com.barofarm.barofarm.dto.admin.AdminMemberDTO;
import com.barofarm.barofarm.dto.admin.AdminMemberUpdateDTO;
import com.barofarm.barofarm.service.admin.AdminMemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/members")
public class AdminMemberController {

    private final AdminMemberService adminMemberService;

    // 회원 목록 조회 (Page<AdminMemberDTO> 리턴)
    @GetMapping
    public Page<AdminMemberDTO> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword
    ) {
        return adminMemberService.getMembers(page, size, keyword);
    }

    @PutMapping("/{userId}")
    public void updateMember(
            @PathVariable String userId,
            @RequestBody AdminMemberUpdateDTO dto
    ) {
        adminMemberService.updateMemberDetail(userId, dto);
    }

}
