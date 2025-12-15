package com.barofarm.barofarm.dto;

import java.util.List;

import com.barofarm.barofarm.dto.member.ProducerDTO;
import com.barofarm.barofarm.dto.salesBoard.BoardImageDTO;
import com.barofarm.barofarm.dto.salesBoard.OptionDetailDTO;
import com.barofarm.barofarm.dto.salesBoard.OptionGroupDTO;
import com.barofarm.barofarm.dto.salesBoard.QnaDTO;
import com.barofarm.barofarm.dto.salesBoard.ReviewDTO;
import com.barofarm.barofarm.dto.salesBoard.SalesBoardDetailResponse;
import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class SalesBoardDetailDTO {
	
	private SalesBoardDetailResponse salesBoard; //상품 기본정보
	private List<BoardImageDTO> images; // 상품 이미지 리스트(썸네일 상세 이미지)
	private List<OptionGroupDTO> optionGroups; // 옵션 그룹 리스트(예: 중량 선택 / 구성 선택)
	private List<OptionDetailDTO> optionDetails; //옵션 상세 그룹 (예: 3kg,5kg)
	private ProducerDTO  producer; //판매자 정보 (사업자명, 사업장주소 )
	private List<ReviewDTO> reviews; //리뷰 목록
	private final List<QnaDTO> qnas; // 문의사항 DTO 목록 (선택)
	
	 public static SalesBoardDetailDTO from(
	            SalesBoardDetailResponse board,
	            List<BoardImageDTO> images,
	            List<OptionGroupDTO> optionGroups,
	            List<OptionDetailDTO> optionDetails,
	            ProducerDTO producer,
	            List<ReviewDTO> reviews,
	            List<QnaDTO> qnas
	    ) {
	        return SalesBoardDetailDTO.builder()
	                .salesBoard(board)
	                .images(images)
	                .optionGroups(optionGroups)
	                .optionDetails(optionDetails)
	                .producer(producer)
	                .reviews(reviews)
	                .qnas(qnas)
	                .build();
	    }
 
}
