package com.barofarm.barofarm.dto.admin;

import lombok.Data;

@Data
public class SimpleCountsDTO {
    private Long pendingSellerCount; //승인대기셀러
    private Long productCount; //등록상품수
    private Long todayOrderCount; // 오늘 주문수
    private Long pendingReportCount; //처리 대기 신고
}
