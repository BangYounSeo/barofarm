package com.barofarm.barofarm.controller;

import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.SalesBoard;
import com.barofarm.barofarm.dto.WishlistItemDTO;
import com.barofarm.barofarm.entity.Good;
import com.barofarm.barofarm.repository.GoodRepository;
import com.barofarm.barofarm.repository.SalesBoardRepository;
import com.barofarm.barofarm.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal; // 🔥 Principal import 추가!
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final GoodRepository goodRepository;
    private final MemberService memberService;
    private final SalesBoardRepository salesBoardRepository;

    /**
     * 🔥 찜 토글 API
     * - 이미 찜한 경우 → 삭제 (false 반환)
     * - 찜 안한 경우 → 추가 (true 반환)
     */
    @PostMapping("/{numBrd}")
    public ResponseEntity<?> toggleWishlist(
            @PathVariable String numBrd,
            Principal principal // 🔥 Security 설정 변경 없이 username(=userId) 자동 주입
    ) {
        // 로그인된 사용자 아이디 가져오기
        String userId = principal.getName();
        Member member = memberService.getMemberByUserId(userId);

        // 기존 찜 여부 확인
        Good exist = goodRepository.findByMemberAndTargetTypeAndTargetId(
                member, "PRODUCT", numBrd
        );

        if (exist != null) {
            goodRepository.delete(exist);
            return ResponseEntity.ok(false); // 찜 취소
        }

        // 신규 찜 등록
        Good newWish = new Good();
        newWish.setMember(member);
        newWish.setTargetType("PRODUCT");
        newWish.setTargetId(numBrd);
        goodRepository.save(newWish);

        return ResponseEntity.ok(true);
    }

    /**
     * 🔍 특정 상품이 찜 상태인지 조회 API
     * - true → 찜한 상태
     * - false → 찜하지 않음
     */
    @GetMapping("/{numBrd}")
    public ResponseEntity<?> isWishItem(
            @PathVariable String numBrd,
            Principal principal
    ) {
        String userId = principal.getName();
        Member member = memberService.getMemberByUserId(userId);

        boolean exists = goodRepository.existsByMemberAndTargetTypeAndTargetId(
                member, "PRODUCT", numBrd);

        return ResponseEntity.ok(exists);
    }

    /**
     * 📌 회원의 모든 찜 목록 조회 API
     */
    @GetMapping("")
    public ResponseEntity<?> getMyWishlist(Principal principal) {

        String userId = principal.getName();
        Member member = memberService.getMemberByUserId(userId);

        List<Good> list = goodRepository.findByMemberAndTargetType(member, "PRODUCT");

        // 🔥 DTO 변환
        List<WishlistItemDTO> dtoList = list.stream().map(g -> {
            // 상품 정보 가져오기
            SalesBoard board = salesBoardRepository.findById(
                    Integer.parseInt(g.getTargetId())
            ).orElse(null);

            if (board == null) {
                return null;
            }

            return new WishlistItemDTO(
                    board.getNumBrd(),
                    board.getSubject(),
                    board.getThumbnail(),
                    board.getPrice()
            );
        }).filter(dto -> dto != null).collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

}
