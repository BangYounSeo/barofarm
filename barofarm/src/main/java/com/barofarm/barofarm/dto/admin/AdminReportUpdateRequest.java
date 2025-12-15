// src/main/java/com/barofarm/barofarm/dto/admin/AdminReportUpdateRequest.java
package com.barofarm.barofarm.dto.admin;

import lombok.Data;

@Data
public class AdminReportUpdateRequest {
    private String status;        // READY / DELETE / CANCEL / LOGIN_LIMIT
    private String statusReason;  // 상태 변경 사유 (관리자 메모)
}
