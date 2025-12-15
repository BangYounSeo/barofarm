package com.barofarm.barofarm.dto.admin;

import lombok.Data;

@Data
public class MonthlyRevenueDTO {
    private String yearMonth; //"2025-12-01"
    private Long amount;
}
