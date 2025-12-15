package com.barofarm.barofarm.dto.admin;

import lombok.Data;

@Data
public class ProductStatDTO {
    private Long boardId; //salesBoard.NUM_BRD
    private String subject;
    private String userId;
    private Integer price;
    private Long count; //구매수 / 컴플레인수 
}
