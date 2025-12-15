// src/main/java/com/barofarm/barofarm/service/admin/AdminDashboardService.java
package com.barofarm.barofarm.service.admin;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.barofarm.barofarm.dto.admin.AdminDashboardSummaryDTO;
import com.barofarm.barofarm.dto.admin.RevenueSummaryDTO;
import com.barofarm.barofarm.dto.admin.MonthlyRevenueDTO;
import com.barofarm.barofarm.dto.admin.SignupStatDTO;
import com.barofarm.barofarm.dto.admin.ProductStatDTO;
import com.barofarm.barofarm.dto.admin.SimpleCountsDTO;

import com.barofarm.barofarm.repository.PlatformAccountRepository;
import com.barofarm.barofarm.repository.PlatformAmountTransactionRepository;
import com.barofarm.barofarm.repository.PurchaseDetailRepository;
import com.barofarm.barofarm.repository.MemberRepository;
import com.barofarm.barofarm.repository.ProducerRepository;
import com.barofarm.barofarm.repository.SalesBoardRepository;
import com.barofarm.barofarm.repository.PurchaseGroupRepository;
import com.barofarm.barofarm.repository.ReportDetailRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final PlatformAccountRepository platformAccountRepository;
    private final PlatformAmountTransactionRepository platformAmountTransactionRepository;
    private final PurchaseDetailRepository purchaseDetailRepository;
    private final MemberRepository memberRepository;
    private final ProducerRepository producerRepository;
    private final SalesBoardRepository salesBoardRepository;
    private final PurchaseGroupRepository purchaseGroupRepository;
    private final ReportDetailRepository reportDetailRepository;

    /**
     * 관리자 대시보드 전체 요약
     * - 바로팜 수익금(전체 + 월별)
     * - 일주일 간 회원가입 수
     * - 제일 많이 산 제품 TOP5
     * - 컴플레인 많은 제품 TOP5
     * - 승인대기셀러/등록상품수/오늘주문수/신고대기 수
     */
    public AdminDashboardSummaryDTO getDashboardSummary() {
        AdminDashboardSummaryDTO dto = new AdminDashboardSummaryDTO();

        // 1. 수익 정보
        dto.setRevenue(buildRevenueSummary());

        // 2. 일주일 간 회원가입 수
        dto.setWeeklySignups(loadWeeklySignups());

        // 3. 제일 많이 산 제품 TOP5
        dto.setBestSellers(loadBestSellerTop5());

        // 4. 컴플레인 많은 제품 TOP5
        dto.setComplaintTop5(loadComplaintTop5());

        // 5. 작은 카드 4개
        dto.setCounts(loadSimpleCounts());

        return dto;
    }

    /**
     * 바로팜 수익 요약 (전체 수익 + 월별 수익)
     */
    public RevenueSummaryDTO buildRevenueSummary() {
        RevenueSummaryDTO revenueDTO = new RevenueSummaryDTO();

        // 전체 수익금 (PLATFORM_ACCOUNT)
        Long totalBalance = platformAccountRepository.findTotalBalance();
        revenueDTO.setTotalRevenue(totalBalance != null ? totalBalance : 0L);

        // 월별 수익 (PLATFORM_AMOUNT_TRANSACTION, TYPE = 'PAID')
        List<Object[]> rows = platformAmountTransactionRepository.findMonthlyRevenue();

        List<MonthlyRevenueDTO> monthlyList = rows.stream()
            .map(row -> {
                MonthlyRevenueDTO m = new MonthlyRevenueDTO();
                // row[0] = YM (String, 'YYYY-MM')
                // row[1] = AMOUNT (Number)
                m.setYearMonth((String) row[0]);
                m.setAmount(((Number) row[1]).longValue());
                return m;
            })
            .collect(Collectors.toList());

        revenueDTO.setMonthlyRevenue(monthlyList);
        return revenueDTO;
    }

    /**
     * 일주일 간 회원가입 수
     * - MEMBER.CREATED 기준 최근 7일(오늘 포함)
     */
    public List<SignupStatDTO> loadWeeklySignups() {
        List<Object[]> rows = memberRepository.findWeeklySignupStats();

        return rows.stream()
        .map(row -> {
            SignupStatDTO dto = new SignupStatDTO();

            Object dateObj = row[0];
            LocalDate date;

            if (dateObj instanceof Date) {
                // java.sql.Date
                date = ((Date) dateObj).toLocalDate();
            } else if (dateObj instanceof Timestamp) {
                // java.sql.Timestamp
                date = ((Timestamp) dateObj).toLocalDateTime().toLocalDate();
            } else {
                // 혹시 모를 경우 방어용
                throw new IllegalStateException(
                    "Unexpected date type from weeklySignups query: " +
                    (dateObj != null ? dateObj.getClass() : "null")
                );
            }

            dto.setDate(date);
            dto.setCount(((Number) row[1]).longValue());
            return dto;
        })
        .collect(Collectors.toList());
    }

    /**
     * 제일 많이 산 제품 TOP5
     * - PURCHASE_DETAIL + SALES_BOARD
     */
    public List<ProductStatDTO> loadBestSellerTop5() {
        List<Object[]> rows = purchaseDetailRepository.findBestSellerTop5();

        return rows.stream()
            .map(row -> {
                ProductStatDTO dto = new ProductStatDTO();
                // row[0]=NUM_BRD, row[1]=SUBJECT, row[2]=USER_ID, row[3]=PRICE, row[4]=TOTAL_QTY
                dto.setBoardId(((Number) row[0]).longValue());
                dto.setSubject((String) row[1]);
                dto.setUserId((String) row[2]);
                dto.setPrice(((Number) row[3]).intValue());
                dto.setCount(((Number) row[4]).longValue()); // TOTAL_QTY
                return dto;
            })
            .collect(Collectors.toList());
    }

    /**
     * 컴플레인(취소/환불) 많은 제품 TOP5
     * - PLATFORM_AMOUNT_TRANSACTION(TYPE IN ('CANCEL','REFUNDED')) + PURCHASE_DETAIL + SALES_BOARD
     */
    public List<ProductStatDTO> loadComplaintTop5() {
        List<Object[]> rows = platformAmountTransactionRepository.findComplaintTop5();

        return rows.stream()
            .map(row -> {
                ProductStatDTO dto = new ProductStatDTO();
                // row[0]=NUM_BRD, row[1]=SUBJECT, row[2]=USER_ID, row[3]=PRICE, row[4]=CANCEL_CNT
                dto.setBoardId(((Number) row[0]).longValue());
                dto.setSubject((String) row[1]);
                dto.setUserId((String) row[2]);
                dto.setPrice(((Number) row[3]).intValue());
                dto.setCount(((Number) row[4]).longValue()); // CANCEL_CNT
                return dto;
            })
            .collect(Collectors.toList());
    }

    /**
     * 작은 카드 4개
     * - 승인대기 셀러 수
     * - 등록 상품 수
     * - 오늘 주문 수
     * - 신고 대기 수
     */
    public SimpleCountsDTO loadSimpleCounts() {
        SimpleCountsDTO dto = new SimpleCountsDTO();

        Long pendingSeller = producerRepository.countPendingProducers();
        Long productCount = salesBoardRepository.countAllProducts();   // 또는 salesBoardRepository.count()
        Long todayOrders = purchaseGroupRepository.countTodayOrders();
        Long pendingReports = reportDetailRepository.countPendingReports();

        dto.setPendingSellerCount(pendingSeller != null ? pendingSeller : 0L);
        dto.setProductCount(productCount != null ? productCount : 0L);
        dto.setTodayOrderCount(todayOrders != null ? todayOrders : 0L);
        dto.setPendingReportCount(pendingReports != null ? pendingReports : 0L);

        return dto;
    }
}
