package com.barofarm.barofarm.dto;

import com.barofarm.barofarm.entity.SalesBoard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesBoardDTO {

	private String userId;
	private int numBrd;
    private String subject;
    private String productType;
    private int productItem;
    private String origin;
    private int price;
    private int stock;
    private int hitCount;
    private String status;
    private String created;
    private String content;

    // 나중에 썸네일 이미지 붙일 자리
    private String thumbnail; 
    
    public static SalesBoardDTO toDTO(SalesBoard entity) {

    	return SalesBoardDTO.builder()
    			.userId(entity.getMember()!=null? entity.getMember().getUserId():null)
    			.numBrd(entity.getNumBrd())
    			.subject(entity.getSubject())
    			.productType(entity.getProductType())
    			.productItem(entity.getProductItem())
    			.origin(entity.getOrigin()!=null? entity.getOrigin():null)
    			.price(entity.getPrice())
    			.stock(entity.getStock())
    			.hitCount(entity.getHitCount())
    			.status(entity.getStatus())
    			.created(entity.getCreated().toString())
    			.content(entity.getContent())
    			.thumbnail(entity.getThumbnail())
    			.build();
    }
    
}
