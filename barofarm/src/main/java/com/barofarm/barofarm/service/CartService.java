package com.barofarm.barofarm.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.barofarm.barofarm.dto.CartRequest;
import com.barofarm.barofarm.dto.salesBoard.CartDTO;
import com.barofarm.barofarm.entity.Cart;
import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.SalesBoard;
import com.barofarm.barofarm.entity.SalesOptionDetail;
import com.barofarm.barofarm.repository.CartRepository;
import com.barofarm.barofarm.repository.MemberRepository;
import com.barofarm.barofarm.repository.SalesBoardRepository;
import com.barofarm.barofarm.repository.SalesOptionDetailRepository;
import com.solapi.shadow.okhttp3.Request;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {
	
	private final CartRepository cartRepository;
    private final MemberRepository memberRepository;
    private final SalesBoardRepository salesBoardRepository;
    private final SalesOptionDetailRepository optionDetailRepository;
    
    public void addCart(CartRequest req) {

    	Member member = memberRepository.findByUserId(req.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        SalesBoard board = salesBoardRepository.findById(req.getNumBrd())
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        SalesOptionDetail option = optionDetailRepository.findById(req.getNumOptD())
                .orElseThrow(() -> new RuntimeException("옵션 없음"));
        
      // ⭐ 동일 상품/옵션 있는지 체크
        Cart existing = cartRepository
                .findByMember_UserIdAndSalesOptionDetail_NumOptD(req.getUserId(), req.getNumOptD());

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + req.getQuantity());
            cartRepository.save(existing);
            return;
        }
        
        Cart cart = new Cart();
        cart.setMember(member);
        cart.setSalesBoard(board);
        cart.setSalesOptionDetail(option);
        cart.setQuantity(req.getQuantity());
        cart.setUnitPriceSnapshot(option.getPrice());
        
        cart.setOptionName(req.getOptionName());   // ⭐ 옵션명 저장

        cartRepository.save(cart);
    }

    public List<CartDTO> getCartList(String userId) {
        List<Cart> carts = cartRepository.findByMember_UserId(userId);

        return carts.stream()
                .map(CartDTO::from)
                .collect(Collectors.toList());
    }


    /* ================================
       ⭐ 선택된 cartId 목록 삭제
    ================================= */
    public void deleteCartItems(List<Integer> cartIds) {
        cartRepository.deleteAllById(cartIds);
    }

    /* ================================
       ⭐ 전체 삭제 (회원 아이디 기준)
    ================================= */
    public void deleteAll(String userId) {
        List<Cart> carts = cartRepository.findByMember_UserId(userId);
        cartRepository.deleteAll(carts);
    }

    /* ================================
       ⭐ 수량 변경
    ================================= */
    public void updateQuantity(CartRequest req) {
        Cart cart = cartRepository.findById(req.getCartId())
                .orElseThrow(() -> new RuntimeException("장바구니 항목 없음"));

        cart.setQuantity(req.getQuantity());
        cartRepository.save(cart);
    }
}
