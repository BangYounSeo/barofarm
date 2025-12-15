// src/main/java/com/barofarm/barofarm/service/admin/AdminReportService.java
package com.barofarm.barofarm.service.admin;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.barofarm.barofarm.Enum.AccountStatus;
import com.barofarm.barofarm.dto.admin.AdminReportDTO;
import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.ReportDetail;
import com.barofarm.barofarm.entity.Review;
import com.barofarm.barofarm.repository.ReportDetailRepository;
import com.barofarm.barofarm.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportService {

    private final ReportDetailRepository reportDetailRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 신고 목록 조회 (페이징 + 검색 + 상태필터)
     */
    public Page<AdminReportDTO> getReports(String keyword, String status, int page, int size) {
        String statusFilter = (status == null || status.trim().isEmpty()) ? null : status;
        String keywordFilter = (keyword == null || keyword.trim().isEmpty()) ? null : keyword;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "created"));

        Page<ReportDetail> result =
                reportDetailRepository.searchForAdmin(statusFilter, keywordFilter, pageable);

        return result.map(this::toDTO);
    }

    private AdminReportDTO toDTO(ReportDetail rd) {
        AdminReportDTO dto = new AdminReportDTO();

        dto.setReportId(rd.getNumRep());
        dto.setTargetType(rd.getTargetType());
        dto.setTargetId(rd.getTargetId());
        dto.setCreated(rd.getCreated());
        dto.setStatus(rd.getStatus());
        dto.setStatusLabel(resolveStatusLabel(rd.getStatus()));
        dto.setStatusReason(rd.getStatusReason());

        Member member = rd.getMember();
        if (member != null) {
            dto.setUserId(member.getUserId());
        }

        String rawReason = rd.getReason();
        dto.setRawReason(rawReason);

        if (rawReason != null) {
            String[] parts = rawReason.split(" - ", 2);
            String code = parts.length > 0 ? parts[0].trim() : "";
            String detail = parts.length > 1 ? parts[1].trim() : "";

            dto.setReasonCode(code);
            dto.setReasonDetail(detail);

            String label = resolveReasonLabel(code);
            dto.setReasonLabel(label);

            dto.setReasonText(
                detail.isEmpty()
                    ? label
                    : label + " - " + detail
            );
        }

        // 대상이 REVIEW일 때 댓글 내용도 같이 내려주기
        if ("REVIEW".equalsIgnoreCase(rd.getTargetType())) {
            try {
                int reviewId = Integer.parseInt(rd.getTargetId());
                Optional<Review> opt = reviewRepository.findById(reviewId);
                opt.ifPresent(review -> dto.setReviewContent(review.getContent()));
            } catch (NumberFormatException ignore) {
            }
        }

        return dto;
    }

    private String resolveReasonLabel(String code) {
        if (code == null) return "기타";
        switch (code.toUpperCase()) {
            case "AD":
                return "광고/홍보글";
            case "ABUSE":
                return "욕설";
            case "ETC":
                return "기타";
            default:
                return "기타";
        }
    }

    private String resolveStatusLabel(String status) {
        if (status == null) return "";
        switch (status.toUpperCase()) {
            case "READY":
                return "대기";
            case "DELETE":
                return "삭제";
            case "CANCEL":
                return "신고취소";
            case "BLOCKED":
                return "로그인 제한";
            default:
                return status;
        }
    }

    /**
     * 상태 변경 + 부가 처리(댓글 내용 치환, 로그인 제한 등)
     */
    @Transactional
    public void updateReport(Integer reportId, String newStatus, String statusReason) {
        ReportDetail report = reportDetailRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신고입니다. id=" + reportId));

        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("상태는 필수입니다.");
        }

        String upperStatus = newStatus.toUpperCase();

        report.setStatus(upperStatus);
        report.setStatusReason(statusReason);

        // 상태에 따른 후속 조치
        if ("DELETE".equals(upperStatus)) {
            handleDeleteTargetReview(report);
        } else if ("BLOCKED".equals(upperStatus)) {
            handleLoginLimit(report);
        }
        // CANCEL 은 별도 작업 없음 (신고 취소)
    }

    /**
     * DELETE 상태일 때: 리뷰의 CONTENT 를 "신고된 댓글입니다." 로 치환
     */
    private void handleDeleteTargetReview(ReportDetail report) {
        if (!"REVIEW".equalsIgnoreCase(report.getTargetType())) {
            return;
        }
        try {
            int reviewId = Integer.parseInt(report.getTargetId());
            Optional<Review> opt = reviewRepository.findById(reviewId);
            if (opt.isPresent()) {
                Review review = opt.get();
                review.setContent("신고된 댓글입니다.");
                // JPA 변경감지로 자동 flush
            }
        } catch (NumberFormatException ignore) {
        }
    }

    /**
     * BLOCKED 상태일 때: 신고된 회원 로그인 제한
     * (AccountStatus.BLOCKED 는 enum 에 추가해줘야 함)
     */
    private void handleLoginLimit(ReportDetail report) {
        Member member = report.getMember();
        if (member == null) return;

        // AccountStatus enum 에 BLOCKED 값을 하나 만들어서 사용
        member.setStatus(AccountStatus.BLOCKED);
        // 역시 변경감지로 업데이트 됨
    }

    /**
     * 휴지통 아이콘 → 신고 내역 자체 삭제
     */
    @Transactional
    public void deleteReport(Integer reportId) {
        reportDetailRepository.deleteById(reportId);
    }
}
