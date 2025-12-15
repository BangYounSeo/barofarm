// com.barofarm.barofarm.controller.admin.AdminDashboardController
package com.barofarm.barofarm.controller.admin;
import com.barofarm.barofarm.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.barofarm.barofarm.Enum.AccountStatus;
import com.barofarm.barofarm.dto.admin.AdminDashboardSummaryDTO;
import com.barofarm.barofarm.repository.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    private final MemberRepository memberRepository;

    @GetMapping("/dashboard2")
    public Map<String, Object> getSummary() {
        Map<String, Object> map = new HashMap<>();

        map.put("totalMembers", memberRepository.count());
        map.put("activeMembers", memberRepository.countByStatus(AccountStatus.ACTIVE));

        return map;
    }

    @GetMapping("/dashboard")
    public AdminDashboardSummaryDTO getDashboardSummary() {
        return adminDashboardService.getDashboardSummary();
    }
}

