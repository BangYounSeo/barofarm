package com.barofarm.barofarm.dto.kamis;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KamisDailyDTO {

    private Long id;

    private String itemName;
    private String productName;
    private String productNo;
    private String categoryCode;
    private String productClsCode;
    private String productClsName;
    private String lastestDate;
    

    private String direction;
    private String unit;
    private double value; 

    private String day1;
    private int dpr1;
    private String day2;
    private int dpr2;
    private String day3;
    private int dpr3;
    private String day4;
    private int dpr4;
}
