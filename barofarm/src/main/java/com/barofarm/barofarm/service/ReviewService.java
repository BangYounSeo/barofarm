package com.barofarm.barofarm.service;


import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.barofarm.barofarm.dto.ReportRequestDTO;
import com.barofarm.barofarm.dto.salesBoard.ReviewDTO;
import com.barofarm.barofarm.dto.salesBoard.ReviewWriteDTO;
import com.barofarm.barofarm.entity.*;
import com.barofarm.barofarm.repository.*;
import com.barofarm.barofarm.service.S3Service.S3UploadResult;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
	
	private static final String TARGET_TYPE_REVIEW = "REVIEW";
	

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;
    private final SalesBoardRepository salesBoardRepository;
    private final S3Service s3Service;
    private final ReviewImageRepository reviewImageRepository;
    
    private final GoodRepository goodRepository;            
    private final ReportDetailRepository reportDetailRepository; 

    public void saveReview(ReviewWriteDTO dto) throws Exception {

        Member member = memberRepository.findByUserId(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("회원 정보 없음"));

        SalesBoard board = salesBoardRepository.findById(dto.getNumBrd())
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        Review review = new Review();
        review.setContent(dto.getContent());
        review.setGrade(dto.getGrade());
        review.setMember(member);
        review.setSalesBoard(board);

        reviewRepository.save(review);

        // 정렬순번
        AtomicInteger order = new AtomicInteger(1);

        if (dto.getImages() != null) {
            dto.getImages().forEach(mf -> {
                try {
                    // ⭐ S3 업로드 결과 객체로 받아오기 (import 사용)
                    S3UploadResult result = s3Service.uploadFile(mf);

                    ReviewImage img = new ReviewImage();
                    img.setReview(review);

                    // ⭐ 아래 4개 필드는 반드시 저장!
                    img.setUrl(result.getUrl());                   // 바로 사용할 URL
                    img.setSaveFileName(result.getSaveFileName()); // S3 파일명
                    img.setPath(result.getPath());                 // 폴더 경로
                    img.setOriginalFileName(mf.getOriginalFilename());

                    // ⭐ 순서/썸네일 설정 유지
                    img.setSortOrder(order.get());
                    img.setIsThumbnail(order.get() == 1 ? "Y" : "N");

                    reviewImageRepository.save(img);
                    order.getAndIncrement();

                } catch (Exception e) {
                    throw new RuntimeException("이미지 저장 실패: " + e.getMessage());
                }
            });
        }
    }
    
 // ⭐ 페이징 조회 추가
 // ⭐ 수정된 코드
    public Page<ReviewDTO> getPagedReviews(int numBrd, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("created").descending());
        Page<Review> reviewPage = reviewRepository.findBySalesBoard_NumBrdOrderByCreatedDesc(numBrd, pageable);
        return reviewPage.map(ReviewDTO::from);  // ⭐ DTO로 변환
    }

    // ⭐ 전체 리뷰 수 조회
    public long getReviewCount(int numBrd) {
        return reviewRepository.countBySalesBoard_NumBrd(numBrd);
    }
    
 // ⭐ 리뷰 좋아요 정보 조회 (로그인 X 가능)
    public Map<String, Object> getReviewGoodInfo(int numRev, Member member) {

        String targetId = String.valueOf(numRev);

        long likeCount = goodRepository
                .countByTargetTypeAndTargetId(TARGET_TYPE_REVIEW, targetId);

        boolean liked = false;
        if (member != null) {
            liked = goodRepository
                    .existsByTargetTypeAndTargetIdAndMember(
                            TARGET_TYPE_REVIEW, targetId, member);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("likeCount", likeCount);
        result.put("liked", liked);
        return result;
    }
    
 // ⭐ 리뷰 좋아요 토글 (로그인 필요)
    public Map<String, Object> toggleReviewGood(int numRev, Member member) {

        Review review = reviewRepository.findById(numRev)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));

        String targetId = String.valueOf(numRev);

        Optional<Good> existing = goodRepository
                .findByTargetTypeAndTargetIdAndMember(
                        TARGET_TYPE_REVIEW, targetId, member);

        boolean liked;
        if (existing.isPresent()) {
            // 이미 눌렀으면 취소
            goodRepository.delete(existing.get());
            liked = false;
        } else {
            // 처음 누르는 경우
            Good good = new Good();
            good.setMember(member);
            good.setTargetType(TARGET_TYPE_REVIEW);
            good.setTargetId(targetId);
            goodRepository.save(good);
            liked = true;
        }

        long likeCount = goodRepository
                .countByTargetTypeAndTargetId(TARGET_TYPE_REVIEW, targetId);

        Map<String, Object> result = new HashMap<>();
        result.put("likeCount", likeCount);
        result.put("liked", liked);
        return result;
    }

 // ⭐ 리뷰 신고 (중복 신고 방지)
    public void reportReview(int numRev, Member member, ReportRequestDTO dto) {

        Review review = reviewRepository.findById(numRev)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));

        String targetId = String.valueOf(numRev);

        // 🛑 같은 유저가 같은 리뷰 여러 번 신고 못하게
        boolean already = reportDetailRepository
                .existsByTargetTypeAndTargetIdAndMember(
                        TARGET_TYPE_REVIEW, targetId, member);

        if (already) {
            throw new IllegalStateException("이미 신고한 리뷰입니다.");
        }

        // 📌 신고 사유 합치기 (reasonCode + detail)
        String reason = dto.getReasonCode();
        if (dto.getDetail() != null && !dto.getDetail().trim().isEmpty()) {
            reason += " - " + dto.getDetail().trim();
        }

        // 🚨 신고 저장
        ReportDetail report = new ReportDetail();
        report.setMember(member);
        report.setTargetType(TARGET_TYPE_REVIEW);
        report.setTargetId(targetId);
        report.setReason(reason);
        report.setStatus("READY");  // 기본 상태 (관리자 확인 전)

        reportDetailRepository.save(report);
    }
    
 // 리뷰 수정
    public void updateReview(int numRev, ReviewWriteDTO dto, Member member) {

        Review review = reviewRepository.findById(numRev)
                .orElseThrow(() -> new RuntimeException("리뷰 없음"));

        if (!review.getMember().getUserId().equals(member.getUserId())) {
            throw new RuntimeException("본인 리뷰만 수정할 수 있습니다");
        }

        review.setContent(dto.getContent());
        review.setGrade(dto.getGrade());

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            reviewImageRepository.deleteByReview(review);
            saveReviewImages(dto, review);
        }
    }
    
    private void saveReviewImages(ReviewWriteDTO dto, Review review) {
        AtomicInteger order = new AtomicInteger(1);

        dto.getImages().forEach(mf -> {
            try {
                S3UploadResult result = s3Service.uploadFile(mf);

                ReviewImage img = new ReviewImage();
                img.setReview(review);

                img.setUrl(result.getUrl());
                img.setSaveFileName(result.getSaveFileName());
                img.setPath(result.getPath());
                img.setOriginalFileName(mf.getOriginalFilename());

                img.setSortOrder(order.get());
                img.setIsThumbnail(order.get() == 1 ? "Y" : "N");

                reviewImageRepository.save(img);
                order.getAndIncrement();

            } catch (Exception e) {
                throw new RuntimeException("이미지 저장 실패: " + e.getMessage());
            }
        });
    }
    
    public Review findById(int numRev) {
        return reviewRepository.findById(numRev)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
    }


    //리뷰 삭제
    public void deleteReview(int numRev, Member member) {

        Review review = reviewRepository.findById(numRev)
                .orElseThrow(() -> new RuntimeException("리뷰 없음"));

        if (!review.getMember().getUserId().equals(member.getUserId())) {
            throw new RuntimeException("본인 리뷰만 삭제할 수 있습니다");
        }

        reviewImageRepository.deleteByReview(review);
        reviewRepository.delete(review);
    }

    
}
