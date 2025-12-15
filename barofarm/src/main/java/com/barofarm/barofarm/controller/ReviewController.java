package com.barofarm.barofarm.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartException;

import com.barofarm.barofarm.dto.salesBoard.ReviewDTO;
import com.barofarm.barofarm.dto.salesBoard.ReviewWriteDTO;
import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.Review;
import com.barofarm.barofarm.repository.MemberRepository;
import com.barofarm.barofarm.service.ReviewService;

import com.barofarm.barofarm.dto.ReportRequestDTO;
import com.barofarm.barofarm.dto.member.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/review")
public class ReviewController {

    private final ReviewService reviewService;
    private final MemberRepository memberRepository; 

    @PostMapping("/write")
    public ResponseEntity<?> writeReview(
            @ModelAttribute ReviewWriteDTO dto,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (user.getUsername() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        dto.setUserId(user.getUsername());

        try {
            reviewService.saveReview(dto);
            return ResponseEntity.ok("리뷰 저장 완료");
        } 
        catch (MultipartException e) {
            return ResponseEntity.badRequest().body("파일 업로드 실패: " + e.getMessage());
        } 
        catch (Exception e) {
            return ResponseEntity.status(500).body("리뷰 저장 실패: " + e.getMessage());
        }
    }
    
    // ===================== 리뷰 단건 상세 조회 =====================
    @GetMapping("/detail/{numRev}")
    public ResponseEntity<?> getReviewDetail(@PathVariable int numRev) {
        Review review = reviewService.findById(numRev);
        return ResponseEntity.ok(ReviewDTO.from(review));
    }
    
    /** ⭐ 리뷰 페이징 조회 */
    @GetMapping("/{numBrd}")
    public ResponseEntity<?> getPagedReviews(
            @PathVariable int numBrd,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        try {
            return ResponseEntity.ok(reviewService.getPagedReviews(numBrd, page, size));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("리뷰 조회 실패: " + e.getMessage());
        }
    }
    

 // 리뷰 수정 (PUT → POST로 변경)
 @PostMapping("/update/{numRev}")
 public ResponseEntity<?> updateReview(
         @PathVariable int numRev,
         @ModelAttribute ReviewWriteDTO dto,
         @AuthenticationPrincipal CustomUserDetails user) {

     if (user == null) {
         return ResponseEntity.status(401).body("로그인이 필요합니다");
     }

     Member member = memberRepository.findByUserId(user.getUsername())
             .orElseThrow(() -> new RuntimeException("회원 정보 없음"));

     reviewService.updateReview(numRev, dto, member);
     return ResponseEntity.ok("리뷰 수정 완료");
 }
    
    
  
    

    // ===================== 리뷰 삭제 =====================
    @DeleteMapping("/{numRev}")
    public ResponseEntity<?> deleteReview(
            @PathVariable int numRev,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다");
        }

        Member member = memberRepository.findByUserId(user.getUsername())
                .orElseThrow(() -> new RuntimeException("회원 정보 없음"));

        reviewService.deleteReview(numRev, member);
        return ResponseEntity.ok("리뷰 삭제 완료");
    }

    
 // ===================== 👍 좋아요 조회 =====================
    @GetMapping("/{numRev}/good")
    public ResponseEntity<Map<String, Object>> getReviewGood(
            @PathVariable int numRev,
            @AuthenticationPrincipal CustomUserDetails principal) {

        Member member = (principal != null) ? principal.getMember() : null;

        Map<String, Object> result = reviewService.getReviewGoodInfo(numRev, member);
        return ResponseEntity.ok(result);
    }

    // ===================== 👍 좋아요 토글 =====================
    @PostMapping("/{numRev}/good")
    public ResponseEntity<?> toggleReviewGood(
            @PathVariable int numRev,
            @AuthenticationPrincipal CustomUserDetails user) {  // ✔ CustomUserDetails ❌

    	String userId = user.getUsername();
    	
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
        }

        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("회원 정보 없음"));

        return ResponseEntity.ok(
                reviewService.toggleReviewGood(numRev, member)
        );
    }

    // ===================== 🚨 리뷰 신고 =====================
    @PostMapping("/{numRev}/report")
    public ResponseEntity<?> reportReview(
            @PathVariable int numRev,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody ReportRequestDTO dto) {

    	String userId = user.getUsername();
    	
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
        }

        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("회원 정보 없음"));

        reviewService.reportReview(numRev, member, dto);

        return ResponseEntity.ok("신고 완료");
    }

}

