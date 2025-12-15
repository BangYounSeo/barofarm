//ntt
package com.barofarm.barofarm.entity;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class KamisDailyEntity {

    @Id
    @SequenceGenerator(
            name = "daily_price_seq",
            sequenceName = "DAILY_PRICE_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "daily_price_seq"
    )
    private Long id;

    private String condition;          // 요청 메세지
    private String price;              // 응답 메세지
    private String productClsCode;     // 구분(01:소매, 02:도매)
    private String productClsName;     // 구분 이름
    private String categoryCode;       // 부류코드
    private String categoryName;       // 부류명
    private String productNo;          // 품목코드
    private String lastestDate;        // 최근 조사일
    private String productName;        // 품목명
    private String itemName;           // 품목명 (중복이지만 API에 존재)
    private String unit;               // 단위

    private String day1;
    private Integer dpr1;
    private String day2;
    private Integer dpr2;
    private String day3;
    private Integer dpr3;
    private String day4;
    private Integer dpr4;

    private String direction;          // 등락여부 (0/1/2)
    private Double value;              // 등락율

    private String resultCode;         // 결과코드
}
