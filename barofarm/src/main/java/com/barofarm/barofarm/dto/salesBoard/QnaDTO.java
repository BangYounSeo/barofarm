package com.barofarm.barofarm.dto.salesBoard;

import java.time.LocalDateTime;

import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.member.WriterDetail;
import com.barofarm.barofarm.entity.QnaBoard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QnaDTO {
	
	 private final int numQna;               // 문의 번호
	    private final String title;             // subject → title로 매핑
	    private final String content;           // 문의 내용
	    private final LocalDateTime created;    // 작성일
	    private final String answer;            // answerContent → answer
	    private final LocalDateTime answerAt;   // 답변 날짜
	    private final WriterDetail writer;      // 작성자 정보
	    private final String status;
	    private final SalesBoardDTO board;
	    
	    private final boolean secret;
	    private final String writerId;
	    private final String sellerId;

	    public static QnaDTO from(QnaBoard entity) {
	        return QnaDTO.builder()
	                .numQna(entity.getNumQna())
	                .title(entity.getSubject())          // subject → title
	                .content(entity.getContent())
	                .created(entity.getCreated())
	                .answer(entity.getAnswerContent())   // answerContent → answer
	                .answerAt(entity.getAnswerAt())
	                .writer(
	                        entity.getMember() != null
	                                ? WriterDetail.from(entity.getMember())
	                                : null
	                )
	                .board(SalesBoardDTO.toDTO(entity.getSalesBoard()))
	                .status(entity.getStatus())
	                .secret("Y".equalsIgnoreCase(entity.getIsSecret()))
	                .writerId(entity.getMember() != null ? entity.getMember().getUserId() : null)
	                .sellerId(entity.getSalesBoard() != null
	                        && entity.getSalesBoard().getMember() != null
	                        ? entity.getSalesBoard().getMember().getUserId()
	                        : null)
	                .build();
	    }

}
