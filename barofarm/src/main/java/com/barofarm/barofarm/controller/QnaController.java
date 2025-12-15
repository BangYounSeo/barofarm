package com.barofarm.barofarm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.barofarm.barofarm.dto.member.CustomUserDetails;
import com.barofarm.barofarm.dto.salesBoard.QnaDTO;
import com.barofarm.barofarm.dto.salesBoard.QnaWriteRequest;
import com.barofarm.barofarm.service.QnaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/salesboard/qna")
@RequiredArgsConstructor
public class QnaController {

	  private final QnaService qnaService;

	  @GetMapping("/{numBrd}")
	  public ResponseEntity<List<QnaDTO>> getQnaByProduct(
	          @PathVariable int numBrd,
	          @RequestParam(required = false) String viewerId // 문의 볼 수 있는 id
	  ) {
	      List<QnaDTO> list = qnaService.getQnaByProduct(numBrd, viewerId);
	      return ResponseEntity.ok(list);
	  }
	  //상품 문의 등록
	  @PostMapping("/write")
	  public QnaDTO writeQna(
	          @RequestBody QnaWriteRequest request,
	          @RequestParam String userId // ⭐ 여기서 userId 받음!
	  ) {
	      return qnaService.writeQna(request, userId);
	  }
	  
	  //상품 문의 답변 등록 
	  @PostMapping("/{numQna}/answer")
	  public ResponseEntity<?> writeAnswer(
	          @PathVariable Integer numQna,
	          @RequestBody Map<String, String> request,
	          @AuthenticationPrincipal CustomUserDetails user) {

	      String answerText = request.get("answer");
	      if (answerText == null || answerText.trim().isEmpty()) {
	          return ResponseEntity.badRequest().body("답변 내용이 없습니다");
	      }

	      String sellerId = user.getUsername();
	      qnaService.answerQna(numQna, sellerId, answerText);

	      return ResponseEntity.ok().body("답변 등록 완료");
	  }
	  
	// 상품 문의 답변 삭제
	  @DeleteMapping("/{numQna}/answer")
	  public ResponseEntity<?> deleteAnswer(
	          @PathVariable Integer numQna,
	          @AuthenticationPrincipal CustomUserDetails user
	  ) {
	      if (user == null) {
	          return ResponseEntity.status(401).body("로그인 필요");
	      }

	      String sellerId = user.getUsername();
	      qnaService.deleteAnswer(numQna, sellerId);

	      return ResponseEntity.ok("답변 삭제 완료");
	  }
	  
	// 상품 문의 삭제 (판매자만)
	  @DeleteMapping("/{numQna}")
	  public ResponseEntity<?> deleteQna(
	          @PathVariable Integer numQna,
	          @AuthenticationPrincipal CustomUserDetails user
	  ) {
	      if (user == null) {
	          return ResponseEntity.status(401).body("로그인 필요");
	      }

	      String sellerId = user.getUsername();
	      qnaService.deleteQna(numQna, sellerId);

	      return ResponseEntity.ok("문의글 삭제 완료");
	  }

	}