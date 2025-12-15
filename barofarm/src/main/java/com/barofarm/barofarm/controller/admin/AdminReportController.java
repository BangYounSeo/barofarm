// src/main/java/com/barofarm/barofarm/controller/admin/AdminReportController.java
package com.barofarm.barofarm.controller.admin;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import com.barofarm.barofarm.dto.admin.AdminReportDTO;
import com.barofarm.barofarm.dto.admin.AdminReportUpdateRequest;
import com.barofarm.barofarm.service.admin.AdminReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final AdminReportService adminReportService;

    // 목록 조회
    @GetMapping
    public Page<AdminReportDTO> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        return adminReportService.getReports(keyword, status, page, size);
    }

    // 상태 수정 + 사유
    @PatchMapping("/{reportId}")
    public void update(
            @PathVariable Integer reportId,
            @RequestBody AdminReportUpdateRequest req
    ) {
        adminReportService.updateReport(reportId, req.getStatus(), req.getStatusReason());
    }

    // 신고 내역 삭제 (휴지통)
    @DeleteMapping("/{reportId}")
    public void delete(@PathVariable Integer reportId) {
        adminReportService.deleteReport(reportId);
    }
}
