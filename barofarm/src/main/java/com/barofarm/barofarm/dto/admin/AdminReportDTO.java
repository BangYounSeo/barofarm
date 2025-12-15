// src/main/java/com/barofarm/barofarm/dto/admin/AdminReportDTO.java
package com.barofarm.barofarm.dto.admin;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class AdminReportDTO {

    private Integer reportId;

    private String userId;      // 신고한 유저 아이디
    private String targetType;  // REVIEW
    private String targetId;    // 리뷰 PK (문자열)

    private LocalDateTime created;

    // 원본 reason (DB 값 그대로, 예: "AD - 신고")
    private String rawReason;

    // 파싱결과
    private String reasonCode;    // AD / ABUSE / ETC
    private String reasonLabel;   // 광고/홍보글, 욕설, 기타
    private String reasonDetail;  // "신고" 같은 상세 내용
    private String reasonText;    // "광고/홍보글 - 신고"

    // 상태
    private String status;        // READY / DELETE / CANCEL / LOGIN_LIMIT
    private String statusLabel;   // 대기 / 삭제 / 신고취소 / 로그인 제한

    // 상태 변경 사유 (새 컬럼)
    private String statusReason;

    // 대상 댓글 내용 (REVIEW일 때)
    private String reviewContent;
}
