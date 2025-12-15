package com.barofarm.barofarm.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemDTO {
    // cartId는 cart일 때만 존재, direct면 null
    private Integer cartId;

    // 브랜치/옵션 번호: 문자열로 올 수도 있고 숫자로 올 수도 있음
    private Integer numBrd;
    private Integer numOptD;
    private Integer numOptG;

    private String optionName;
    private String optionValue;
    private String name;
    private Integer price; // 가격
    private Integer stock; // 재고
    private Integer quantity;

    private String enabled; // direct 타입에서 "1"/"0" 형태
    private String productName;
    private String productImage;
}
