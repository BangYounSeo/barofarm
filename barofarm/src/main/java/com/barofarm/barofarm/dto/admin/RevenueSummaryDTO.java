package com.barofarm.barofarm.dto.admin;

import java.util.List;

import lombok.Data;

@Data
public class RevenueSummaryDTO {
    private Long totalRevenue; //platformAccount.BALANCE
    private List<MonthlyRevenueDTO> monthlyRevenue; //월별수익
}
