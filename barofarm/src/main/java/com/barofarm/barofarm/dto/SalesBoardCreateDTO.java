package com.barofarm.barofarm.dto;

import java.util.List;

import com.barofarm.barofarm.dto.salesBoard.OptionGroupDTO;

import lombok.Data;

@Data
public class SalesBoardCreateDTO {

	private String productType;
    private int productItem;
    private String productName;
    private int price;
    private String description;

    private String mainImage;        // Base64
    private List<String> extraImages; // Base64 배열
    
    private String thumbnailUrl;     // 대표이미지 S3 URL
    private List<String> imageUrls;  // 추가이미지 S3 URL 리스트
    
    private String origin;
    private String status;
    private String userId;
    private List<OptionGroupDTO> optionGroups; //옵션그룹 추가
	
}
