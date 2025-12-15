package com.barofarm.barofarm.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyPriceDTO {
    
     private Long id;

    private String itemName;
    private String itemCode;

    private String kindName;
    private String kindCode;

    private String rank;
    private String rankCode;
    private String unit;

    // 날짜 기반 데이터 (API의 day1 ~ day7)
    private String day1;
    private String dpr1;
    private String day2;
    private String dpr2;
    private String day3;
    private String dpr3;
    private String day4;
    private String dpr4;
    private String day5;
    private String dpr5;
    private String day6;
    private String dpr6;
    private String day7;
    private String dpr7;

    // 카테고리
    private String categoryCode;

    // 🔥 실제 저장되는 기준 날짜(YYYY-MM-DD)
    private String regday;

    private String productClsCode;

    private String regionCode;

    private String regionName;


}
