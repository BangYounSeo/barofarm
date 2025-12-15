package com.barofarm.barofarm.dto.salesBoard;

import java.time.LocalDateTime;
import java.time.LocalTime;

import com.barofarm.barofarm.dto.member.WriterDetail;
import com.barofarm.barofarm.entity.SalesBoard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder

//기본 상품 정보용-> 엔티티값을 DTO로 변환하여 값을 넘겨주는 방식, Builder + Getter (불변 형태)
public class SalesBoardDetailResponse {
	

	public int numBrd;
	public String content;
	public LocalDateTime created;
	public int hitConut;
	public String origin;
	public String productType;
	public String status;
	public int stock;
	public String subject;
	public LocalDateTime updated;
	public WriterDetail member;
	public int productItem; 

	public int price;
	
	/**
     * Entity → DTO 변환
     */
    public static SalesBoardDetailResponse from(SalesBoard entity) {
        return SalesBoardDetailResponse.builder()
                .numBrd(entity.getNumBrd())
                .subject(entity.getSubject())
                .content(entity.getContent())
                .productType(entity.getProductType())
                .status(entity.getStatus())
                .created(entity.getCreated())
                .updated(entity.getUpdated())
                .origin(entity.getOrigin())
                .hitConut(entity.getHitCount())
                .stock(entity.getStock())
                .price(entity.getPrice())
                .productItem(entity.getProductItem())
                .member(
                        entity.getMember() != null
                                ? WriterDetail.from(entity.getMember())
                                : null
                )
                .build();
    }
	

}
