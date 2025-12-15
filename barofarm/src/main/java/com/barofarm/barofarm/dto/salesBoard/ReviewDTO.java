package com.barofarm.barofarm.dto.salesBoard;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.member.WriterDetail;
import com.barofarm.barofarm.entity.Review;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewDTO {
	
	 private final int numRev;                     // 리뷰 ID
	    private final String content;                 // 리뷰 내용
	    private final int grade;                      // 별점
	    private final LocalDateTime created;          // 작성일
	    private final WriterDetail member;            // 작성자 정보
	    private final List<ReviewImageDTO> images;    // 리뷰 이미지 목록
	    private final int numBrd;
	    private final String status;
	    private final SalesBoardDTO board;

	    public static ReviewDTO from(Review entity) {
	        return ReviewDTO.builder()
	                .numRev(entity.getNumRev())
	                .content(entity.getContent())
	                .grade(entity.getGrade())
	                .created(entity.getCreated())
	                .member(
	                        entity.getMember() != null
	                                ? WriterDetail.from(entity.getMember())
	                                : null
	                )
	                .images(
	                        entity.getReviewImages() != null
	                                ? entity.getReviewImages().stream()
	                                        .map(ReviewImageDTO::from)
	                                        .collect(Collectors.toList())
	                                : null
	                )
	                .numBrd(
	                		entity.getSalesBoard() != null
	                				? entity.getSalesBoard().getNumBrd()
	                				: 0
	                )
	                .board(SalesBoardDTO.toDTO(entity.getSalesBoard()))
	                .status(entity.getStatus())
	                .build();
	    }

}
