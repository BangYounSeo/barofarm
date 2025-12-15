package com.barofarm.barofarm.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.barofarm.barofarm.dto.CartRequest;
import com.barofarm.barofarm.dto.salesBoard.CartDTO;
import com.barofarm.barofarm.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addCart(@RequestBody CartRequest req) {
        cartService.addCart(req);
        System.out.println("req======"+req);
        return ResponseEntity.ok("장바구니 추가 완료");
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartDTO>> getCartList(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.getCartList(userId));
        
    }
    
    // ⭐ 선택 삭제
    @PostMapping("/delete")
    public ResponseEntity<?> deleteCart(@RequestBody List<Integer> cartIds) {
        cartService.deleteCartItems(cartIds);
        return ResponseEntity.ok("선택된 상품 삭제 완료");
    }

    // ⭐ 전체 삭제
    @PostMapping("/delete-all/{userId}")
    public ResponseEntity<?> deleteAll(@PathVariable String userId) {
        cartService.deleteAll(userId);
        return ResponseEntity.ok("장바구니 전체 삭제 완료");
    }

    // ⭐ 수량 변경
    @PostMapping("/update-quantity")
    public ResponseEntity<?> updateQuantity(@RequestBody CartRequest req) {
        cartService.updateQuantity(req);
        return ResponseEntity.ok("수량 변경 완료");
    }
}
