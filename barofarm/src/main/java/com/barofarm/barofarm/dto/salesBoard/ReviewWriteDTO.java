package com.barofarm.barofarm.dto.salesBoard;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class ReviewWriteDTO {
	
	  	private int numBrd; // 상품 번호
	    private String userId; // 작성자 ID
	    private String content; // 리뷰 내용
	    private int grade; // 평점 (1~5)
	    private List<MultipartFile> images; // 첨부 이미지 리스트

}
