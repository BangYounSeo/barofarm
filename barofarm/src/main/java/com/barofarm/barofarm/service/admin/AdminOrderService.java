package com.barofarm.barofarm.service.admin;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.barofarm.barofarm.Enum.PurchaseDetailStatus;
import com.barofarm.barofarm.dto.admin.AdminPurchaseDetailDTO;
import com.barofarm.barofarm.dto.admin.AdminPurchaseGroupDTO;
import com.barofarm.barofarm.dto.admin.AdminPurchaseSummaryDTO;
import com.barofarm.barofarm.entity.Payment;
import com.barofarm.barofarm.entity.PurchaseDetail;
import com.barofarm.barofarm.entity.PurchaseGroup;
import com.barofarm.barofarm.entity.SalesBoard;
import com.barofarm.barofarm.entity.SalesOptionDetail;
import com.barofarm.barofarm.entity.SalesOptionGroup;
import com.barofarm.barofarm.repository.PaymentRepository;
import com.barofarm.barofarm.repository.PurchaseDetailRepository;
import com.barofarm.barofarm.repository.PurchaseGroupRepository;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final PurchaseGroupRepository groupRepo;
    private final PurchaseDetailRepository detailRepo;
    private final PaymentRepository paymentRepo;

    // 🔹 그룹용 부분취소/부분환불 상태 값(문자열)
    private static final String GROUP_STATUS_PARTIAL_CANCELLATION = "PARTIAL_CANCELLATION";
    private static final String GROUP_STATUS_PARTIAL_REFUND = "PARTIAL_REFUND";

// 🔥 주문 목록 + 검색
    public Page<AdminPurchaseSummaryDTO> getOrders(
            int page,
            int size,
            String keyword,
            String searchType
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "numPurG"));

        Page<PurchaseGroup> result;

        if (keyword == null || keyword.trim().isEmpty()) {
            // 🔹 검색어 없으면 전체 조회
            result = groupRepo.findAll(pageable);
        } else {
            String trimmed = keyword.trim();

            if ("ORDER_NO".equals(searchType)) {
                // 🔹 주문번호 검색
                Long numPurG;
                try {
                    numPurG = Long.valueOf(trimmed);
                } catch (NumberFormatException e) {
                    // 숫자 아니면 결과 0건 리턴
                    return new PageImpl<>(Collections.emptyList(), pageable, 0);
                }
                result = groupRepo.findByNumPurG(numPurG, pageable);

            } else if ("BUYER".equals(searchType)) {
                // 🔹 구매자 userId 검색
                result = groupRepo
                        .findByMember_UserIdContainingIgnoreCase(trimmed, pageable);

            } else if ("SELLER".equals(searchType)) {
                // 🔹 판매자(대표 sellerName) 검색
                result = groupRepo
                        .findBySellerUserIdContainingIgnoreCase(trimmed, pageable);

            } else {
                // 🔹 searchType이 없거나 ALL인 경우: OR 검색 (선택)
                result = groupRepo.searchByKeyword(trimmed, pageable);
            }
        }

        // ✅ 여기서 this::convertToSummaryDTO 사용 (이 클래스 안에 있어야 함)
        return result.map(this::convertToSummaryDTO);
    }

    /** 주문 요약 DTO 변환 */
    private AdminPurchaseSummaryDTO convertToSummaryDTO(PurchaseGroup pg) {
        AdminPurchaseSummaryDTO dto = new AdminPurchaseSummaryDTO();

        dto.setNumPurG((long) pg.getNumPurG());
        dto.setOrderDate(pg.getOrderDate());
        dto.setUserId(pg.getMember().getUserId());

        dto.setReceiverName(pg.getReceiverName());
        dto.setReceiverPhone(pg.getReceiverPhone());
        dto.setReceiverAddr1(pg.getReceiverAddr1());
        dto.setReceiverAddr2(pg.getReceiverAddr2());

        dto.setTotalPrice(pg.getTotalPrice());

        // ✅ 주문 상태는 "무조건 그룹 status" 기준으로 보자
        String displayStatus = pg.getStatus();

        // 혹시라도 null/빈값이면 그때만 보조로 Payment / paymentStatus 사용
        if (displayStatus == null || displayStatus.trim().isEmpty()) {
            Payment pay = pg.getPayment();
            if (pay != null && pay.getStatus() != null && !pay.getStatus().trim().isEmpty()) {
                displayStatus = pay.getStatus();
            } else if (pg.getPaymentStatus() != null && !pg.getPaymentStatus().trim().isEmpty()) {
                displayStatus = pg.getPaymentStatus();
            } else {
                displayStatus = "READYPAY";
            }
        }

        dto.setPaymentStatus(displayStatus);

        // 🔥 부분취소 여부 (기존 그대로)
        List<PurchaseDetail> details = pg.getPurchaseDetails();
        boolean partial = false;
        if (details != null && !details.isEmpty()) {
            int total = details.size();
            int cancelCnt = 0;
            for (PurchaseDetail d : details) {
                if (d.getStatus() == PurchaseDetailStatus.CANCEL) {
                    cancelCnt++;
                }
            }
            partial = cancelCnt > 0 && cancelCnt < total;
        }
        dto.setHasPartialCancel(partial);

        // 🔥 대표 판매자 이름 (기존 코드 유지)
        String sellerName = null;
        if (details != null && !details.isEmpty()) {
            PurchaseDetail firstDetail = details.get(0);
            SalesBoard board = firstDetail.getSalesBoard();
            if (board != null && board.getMember() != null) {
                sellerName = board.getMember().getUserId();
            }
        }
        dto.setSellerName(sellerName);

        return dto;
    }

    /** ============ ② 관리자 주문 상세 조회 ============ */
    public AdminPurchaseGroupDTO getOrder(Long numPurG) {

        PurchaseGroup pg = groupRepo.findById(numPurG.intValue())
                .orElseThrow(new java.util.function.Supplier<RuntimeException>() {
                    @Override
                    public RuntimeException get() {
                        return new RuntimeException("주문 없음");
                    }
                });

        Payment pay = paymentRepo.findByPurchaseGroupNumPurG(numPurG.intValue());
        List<PurchaseDetail> detailList =
                detailRepo.findByPurchaseGroupNumPurG(numPurG.intValue());

        AdminPurchaseGroupDTO dto = new AdminPurchaseGroupDTO();

        dto.setNumPurG((long) pg.getNumPurG());
        dto.setOrderDate(pg.getOrderDate());
        dto.setUserId(pg.getMember().getUserId());

        dto.setReceiverName(pg.getReceiverName());
        dto.setReceiverPhone(pg.getReceiverPhone());
        dto.setReceiverAddr1(pg.getReceiverAddr1());
        dto.setReceiverAddr2(pg.getReceiverAddr2());
        dto.setReceiverPostalCode(pg.getReceiverPostalCode());

        if (pay != null) {
            dto.setPaymentStatus(pay.getStatus());
            dto.setAmount(pay.getAmount());
            dto.setApprovedAt(pay.getApprovedAt());
        }

        dto.setDetails(
                detailList.stream()
                        .map(new java.util.function.Function<PurchaseDetail, AdminPurchaseDetailDTO>() {
                            @Override
                            public AdminPurchaseDetailDTO apply(PurchaseDetail d) {
                                return convertDetail(d);
                            }
                        })
                        .collect(Collectors.toList())
        );

        // 🔥 부분취소 여부 (N개 중 1~N-1개만 CANCEL 일 때 true)
        boolean partial = false;
        if (detailList != null && !detailList.isEmpty()) {
            int total = detailList.size();
            int cancelCnt = 0;
            for (PurchaseDetail d : detailList) {
                if (d.getStatus() == PurchaseDetailStatus.CANCEL) {
                    cancelCnt++;
                }
            }
            partial = cancelCnt > 0 && cancelCnt < total;
        }
        dto.setHasPartialCancel(partial);

        return dto;
    }

    /** ============ ③ 주문 상태 직접 변경 (필요시) ============ */
    @Transactional
    public void changeStatus(int numPurG, String status) {
        PurchaseGroup pg = groupRepo.findById(numPurG)
                .orElseThrow(new java.util.function.Supplier<IllegalArgumentException>() {
                    @Override
                    public IllegalArgumentException get() {
                        return new IllegalArgumentException("주문 없음");
                    }
                });

        pg.setStatus(status);
        // 필요하면 여기에서도 syncGroupStatus(pg) 를 호출해도 됨
        groupRepo.save(pg);
    }

    /** 상세 DTO 변환 */
    private AdminPurchaseDetailDTO convertDetail(PurchaseDetail d) {
        AdminPurchaseDetailDTO dto = new AdminPurchaseDetailDTO();

        // 기본 정보
        dto.setNumPurD((long) d.getNumPurD());
        dto.setQuantity(d.getQuantity());
        dto.setFinalPrice(d.getFinalPrice());
        dto.setStatus(d.getStatus() != null ? d.getStatus().name() : null);

        // 🔹 옵션 정보 (null 안전)
        SalesOptionDetail opt = d.getSalesOptionDetail();
        if (opt != null) {
            dto.setNumOptD((long) opt.getNumOptD());
            dto.setOptionName(opt.getName());
        }

        // 🔹 판매글 정보
        SalesBoard board = d.getSalesBoard();
        if (board == null && opt != null && opt.getSalesOptionGroup() != null) {
            SalesOptionGroup group = opt.getSalesOptionGroup();
            board = group.getSalesBoard();
        }

        if (board != null) {
            dto.setNumBrd((long) board.getNumBrd());
            dto.setSubject(board.getSubject());
            dto.setThumbnail(board.getThumbnail());
        }

        return dto;
    }

    /** ============ ④ 디테일(옵션) 상태 변경 + 그룹 동기화 ============ */
    @Transactional
    public void changeDetailStatus(long numPurD, PurchaseDetailStatus status) {
        PurchaseDetail detail = detailRepo.findById((int) numPurD)
                .orElseThrow(new java.util.function.Supplier<IllegalArgumentException>() {
                    @Override
                    public IllegalArgumentException get() {
                        return new IllegalArgumentException("디테일 없음");
                    }
                });

        // 1) 디테일 상태 변경
        detail.setStatus(status);
        // detailRepo.save(detail);  // 영속 상태라면 @Transactional 로 flush 됨 (있어도 상관 없음)

        // 2) 이 디테일이 속한 그룹 가져오기
        PurchaseGroup group = detail.getPurchaseGroup();
        if (group == null) {
            return;
        }

        // 3) 그룹 status 를 디테일 상태 규칙에 맞게 재계산
        updateGroupStatusByDetails(group);
    }

    /**
     * 같은 주문그룹의 모든 PurchaseDetail 상태를 보고
     * PurchaseGroup.status 를 다음 규칙으로 맞춘다.
     *
     * 규칙:
     *  1) 모든 디테일 status 가 같으면 → 그 status 로 그룹 status 설정
     *     예) [SHIPPING, SHIPPING] → 그룹 = "SHIPPING"
     *
     *  2) 서로 다른 상태가 섞여 있을 때:
     *     - CANCEL 이 하나라도 섞여 있으면 → 그룹 = "PARTIAL_CANCELLATION"
     *     - REFUNDED 가 하나라도 섞여 있으면 → 그룹 = "PARTIAL_REFUND"
     *     - 그 외 (예: [PAID, SHIPPING, SHIPPING]) → 그룹 = 결제 상태(PAID 등) 유지
     */
    private void updateGroupStatusByDetails(PurchaseGroup group) {

        // 같은 그룹의 모든 디테일 가져오기
        List<PurchaseDetail> details =
                detailRepo.findByPurchaseGroupNumPurG(group.getNumPurG());

        if (details == null || details.isEmpty()) {
            return;
        }

        // 상태 집합 + 부분취소/부분환불 여부 체크
        java.util.Set<PurchaseDetailStatus> statusSet =
                new java.util.HashSet<PurchaseDetailStatus>();
        boolean hasCancel = false;
        boolean hasRefunded = false;

        for (PurchaseDetail d : details) {
            PurchaseDetailStatus s = d.getStatus();
            if (s == null) continue;

            statusSet.add(s);
            if (s == PurchaseDetailStatus.CANCEL) {
                hasCancel = true;
            }
            if (s == PurchaseDetailStatus.REFUNDED) {
                hasRefunded = true;
            }
        }

        if (statusSet.isEmpty()) {
            return;
        }

        // 1) N개가 모두 같은 상태이면 → 그 상태로 그룹 status 통일
        if (statusSet.size() == 1) {
            PurchaseDetailStatus only = statusSet.iterator().next();
            group.setStatus(only.name());  // ex) "SHIPPING", "CANCEL", "REFUNDED", ...
            groupRepo.save(group);
            return;
        }

        // 2) 여러 상태가 섞여 있는 경우

        // 2-1) CANCEL 이 섞여 있으면 → PARTIAL_CANCELLATION
        if (hasCancel) {
            group.setStatus(GROUP_STATUS_PARTIAL_CANCELLATION);
            groupRepo.save(group);
            return;
        }

        // 2-2) REFUNDED 가 섞여 있으면 → PARTIAL_REFUND
        if (hasRefunded) {
            group.setStatus(GROUP_STATUS_PARTIAL_REFUND);
            groupRepo.save(group);
            return;
        }

        // 2-3) 그 외 섞여 있음 (예: PAID + SHIPPING + COMPLETE ...)
        //      → 결제 상태(PAID 등)를 그룹 status 로 사용
        Payment pay = group.getPayment();
        String base = "PAID";
        if (pay != null && pay.getStatus() != null && !pay.getStatus().trim().isEmpty()) {
            base = pay.getStatus();
        }
        group.setStatus(base);
        groupRepo.save(group);
    }
}
