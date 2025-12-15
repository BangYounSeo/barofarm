// com.barofarm.barofarm.controller.admin.AdminProducerController
package com.barofarm.barofarm.controller.admin;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import com.barofarm.barofarm.dto.member.ProducerDTO;
import com.barofarm.barofarm.service.admin.AdminProducerService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/producers")
public class AdminProducerController {

    private final AdminProducerService adminProducerService;

    /**
     * 🔹 셀러 목록 조회 (페이징 + 상태필터 + 키워드 검색)
     * GET /api/admin/producers?page=0&size=10&status=PENDING&keyword=농가명
     */
    @GetMapping
    public Page<ProducerDTO> listProducers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return adminProducerService.getProducers(page, size, status, keyword);
    }

    /**
     * 🔹 셀러 상태 변경
     * PATCH /api/admin/producers/{proId}/status
     * { "status": "APPROVED" }
     */
    @PatchMapping("/{proId}/status")
    public void updateStatus(
            @PathVariable Long proId,
            @RequestBody StatusUpdateRequest request
    ) {
        adminProducerService.updateStatus(proId, request.getStatus(), request.getReason());
    }

    @Getter
    public static class StatusUpdateRequest {
        private String status;  // APPROVED, REJECTED, ON_HOLD 등
        private String reason;  // 승인/반려 사유
    }
}
