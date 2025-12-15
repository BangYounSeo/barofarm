package com.barofarm.barofarm.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.barofarm.barofarm.dto.SalesBoardCreateDTO;
import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.salesBoard.ProductDetailResponse;
import com.barofarm.barofarm.service.MemberService;
import com.barofarm.barofarm.service.SalesBoardService;

import lombok.RequiredArgsConstructor;

//프론트엔드 (react)에서 상품 상세 페이지를 요청했을 때 어떤 데이터를 반환해줄지 알려주는 기능을 함
@RestController //rest api로 반환(json 형식) 
@RequestMapping("/api/salesboard") //url 기본 주소
@RequiredArgsConstructor //final 붙은 필드를 자동 생성자로 주입하는 기능
public class SalesBoardController {
	
	private final SalesBoardService salesBoardService;
	
	//상품 상세페이지 조회 api
	//ResponseEntity-> 나중에 header, status 등을 쉽게 조절 가능
	@GetMapping("/{numBrd}")
	  public ResponseEntity<ProductDetailResponse> getDetail(@PathVariable int numBrd) {

        System.out.println("[GET] /api/salesboard/" + numBrd);
        
        // 🔹 서비스에서 DTO를 조립해서 반환
        ProductDetailResponse  dto = salesBoardService.getDetail(numBrd);

        // 🔹 ResponseEntity로 감싸서 반환 (응답 코드 200 명확)
        return ResponseEntity.ok(dto);
	}

	//전체상품 조회 필터링
	@GetMapping
	public ResponseEntity<?> getList(
	        @RequestParam(required = false) String productType,
	        @RequestParam(required = false) Integer productItem,
	        @RequestParam(required = false) String keyword,
	        @RequestParam(defaultValue = "1") int page,
	        @RequestParam(defaultValue = "12") int size
	) {
	    return ResponseEntity.ok(
	        salesBoardService.getList(productType, productItem, keyword, page, size)
	    );
	}
	
	//상품등록
	@PostMapping
	public ResponseEntity<?> create(@RequestBody SalesBoardCreateDTO dto) {
		int createdId = salesBoardService.createProduct(dto);
		
	    return ResponseEntity.ok(createdId);
	}
	
	//상품 수정
	@PutMapping("/{numBrd}")
	public ResponseEntity<?> update(
	        @PathVariable int numBrd,
	        @RequestBody SalesBoardCreateDTO dto) {

	    salesBoardService.update(numBrd, dto);
	    return ResponseEntity.ok("updated");
	}
	
	//상품 삭제
	@DeleteMapping("/{numBrd}")
	public ResponseEntity<?> delete(
	        @PathVariable int numBrd,
	        @RequestParam String userId) {

	    salesBoardService.delete(numBrd, userId);
	    return ResponseEntity.ok("deleted");
	}
	
	//판매 상태 변경
	@PutMapping("/{numBrd}/status")
	public ResponseEntity<?> updateStatus(
	        @PathVariable int numBrd,
	        @RequestParam String status
	) {
	    salesBoardService.updateStatus(numBrd, status);
	    return ResponseEntity.ok("status updated");
	}
	
	@GetMapping("/best")
	public ResponseEntity<?> getBestProducts() {
	    return ResponseEntity.ok(salesBoardService.getBestProducts());
	}

	@GetMapping("/new")
	public ResponseEntity<?> getNewProducts() {
	    return ResponseEntity.ok(salesBoardService.getNewProducts());
	}

	
	// 🔥 인기상품 API (조회수 기준)
	@GetMapping("/popular")
	public ResponseEntity<?> getPopularProducts() {
	    return ResponseEntity.ok(salesBoardService.getPopularProducts());
	}

	
}
