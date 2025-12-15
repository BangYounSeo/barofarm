package com.barofarm.barofarm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.salesBoard.QnaDTO;
import com.barofarm.barofarm.dto.salesBoard.QnaWriteRequest;
import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.QnaBoard;
import com.barofarm.barofarm.entity.SalesBoard;
import com.barofarm.barofarm.repository.MemberRepository;
import com.barofarm.barofarm.repository.QnaBoardRepository;
import com.barofarm.barofarm.repository.SalesBoardRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QnaService {
	
	 private final QnaBoardRepository qnaBoardRepository;
	    private final SalesBoardRepository salesBoardRepository;
	    private final MemberRepository memberRepository;

	    // ================================
	    //   QnA 작성
	    // ================================
	    @Transactional
	    public QnaDTO writeQna(QnaWriteRequest request, String userId) {

	        // 1) 상품 존재 여부 체크
	        SalesBoard board = salesBoardRepository.findById(request.getNumBrd())
	                .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));

	        // 2) 작성자 조회
	        Member member = memberRepository.findById(userId)
	                .orElseThrow(() -> new RuntimeException("회원 정보가 존재하지 않습니다."));

	        // 3) Entity 생성
	        QnaBoard qna = new QnaBoard();
	        qna.setSalesBoard(board);
	        qna.setMember(member);
	        qna.setContent(request.getContent());
	        qna.setIsSecret(request.isSecret() ? "Y" : "N");    // boolean → Y/N
	        qna.setSubject("상품 문의"); // 네이버 기본 패턴처럼 고정 제목
	        qna.setStatus("N"); // 미답변 상태

	        // 4) 저장
	        QnaBoard saved = qnaBoardRepository.save(qna);

	        // 5) DTO 변환 후 반환
	        return QnaDTO.from(saved);
	    }
	    


	    // ================================
	    //   QnA 조회 (상품별)
	    // ================================
	    public List<QnaDTO> getQnaByProduct(int numBrd, String viewerId) {

	        List<QnaBoard> list = qnaBoardRepository
	                .findBySalesBoard_NumBrdOrderByCreatedDesc(numBrd);

	        return list.stream().map(entity -> {
	                    QnaDTO dto = QnaDTO.from(entity);

	                    boolean isWriter = dto.getWriterId() != null
	                            && dto.getWriterId().equals(viewerId);

	                    boolean isSeller = dto.getSellerId() != null
	                            && dto.getSellerId().equals(viewerId);

	                    // 비공개의 경우 → 작성자와 판매자만 볼 수 있도록
	                    if (dto.isSecret() && !isWriter && !isSeller) {
	                        return QnaDTO.builder()
	                                .numQna(dto.getNumQna())
	                                .title("비공개 문의입니다.")
	                                .content("내용이 비공개 처리되었습니다.")
	                                .created(dto.getCreated())
	                                .writer(null)
	                                // ⭐ 답변 여부만 유지 (내용은 숨김)
	                                .answer(dto.getAnswer() != null ? "" : null)
	                                .answerAt(dto.getAnswerAt())
	                                // ⭐ 상태 유지하여 UI에서 “답변완료” 표시됨
	                                .status(dto.getAnswer() != null ? "Y" : "N")
	                                .board(SalesBoardDTO.toDTO(entity.getSalesBoard()))
	                                .secret(true)
	                                .writerId(null)
	                                .sellerId(null)
	                                .build();
	                    }

	                    return dto;
	                })
	                .collect(Collectors.toList());
	    }
	    
	    @Transactional
	    public void answerQna(Integer numQna, String sellerUserId, String answerText) {

	        QnaBoard qna = qnaBoardRepository.findById(numQna)
	                .orElseThrow(() -> new RuntimeException("QnA Not Found"));

	        SalesBoard board = qna.getSalesBoard();
	        if (board == null || board.getMember() == null) {
	            throw new RuntimeException("상품/판매자 정보 없음");
	        }

	        String boardSeller = board.getMember().getUserId();
	        if (!boardSeller.equals(sellerUserId)) {
	            throw new RuntimeException("판매자 권한 없음");
	        }

	        qna.setAnswerContent(answerText); // ANSWER_CONTENT
	        qna.setAnswerAt(LocalDateTime.now()); // ANSWER_AT
	        qna.setAnswerBy(sellerUserId); // ANSWER_BY
	        qna.setStatus("Y"); // 답변완료 상태
	    }
	    
	    @Transactional
	    public void deleteAnswer(Integer numQna, String sellerUserId) {

	        QnaBoard qna = qnaBoardRepository.findById(numQna)
	                .orElseThrow(() -> new RuntimeException("QnA Not Found"));

	        String boardSeller = qna.getSalesBoard().getMember().getUserId();

	        // 판매자만 삭제 가능
	        if (!boardSeller.equals(sellerUserId)) {
	            throw new RuntimeException("판매자 권한 없음");
	        }

	        qna.setAnswerContent(null);
	        qna.setAnswerAt(null);
	        qna.setAnswerBy(null);
	        qna.setStatus("N");
	    }
	    
	    //   ⭐⭐ 문의글(Q) 삭제 추가 ⭐⭐
	    // ================================
	    @Transactional
	    public void deleteQna(Integer numQna, String sellerUserId) {

	        QnaBoard qna = qnaBoardRepository.findById(numQna)
	                .orElseThrow(() -> new RuntimeException("QnA Not Found"));

	        // 문의가 달린 상품의 판매자만 삭제 가능
	        String boardSeller = qna.getSalesBoard().getMember().getUserId();

	        if (!boardSeller.equals(sellerUserId)) {
	            throw new RuntimeException("판매자 권한 없음");
	        }

	        qnaBoardRepository.delete(qna); // ⭐ DB에서 완전 삭제
	    }

	}