package com.barofarm.barofarm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemDTO {

    private int numBrd;       // 상품 번호
    private String subject;   // 상품명
    private String thumbnail; // 상품 썸네일 URL
    private int price;        // 가격
}
