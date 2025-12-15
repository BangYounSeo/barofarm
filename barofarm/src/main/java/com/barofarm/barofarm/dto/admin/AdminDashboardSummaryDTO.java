package com.barofarm.barofarm.dto.admin;

import java.util.List;

import lombok.Data;

@Data
public class AdminDashboardSummaryDTO {
    private RevenueSummaryDTO revenue;
    private List<SignupStatDTO> weeklySignups;
    private List<ProductStatDTO> bestSellers;
    private List<ProductStatDTO> complaintTop5;
    private SimpleCountsDTO counts;
}
