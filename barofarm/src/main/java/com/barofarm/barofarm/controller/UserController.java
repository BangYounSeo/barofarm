package com.barofarm.barofarm.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.barofarm.barofarm.dto.GoodDTO;
import com.barofarm.barofarm.dto.member.BuyerOrderDetailDTO;
import com.barofarm.barofarm.dto.member.CustomUserDetails;
import com.barofarm.barofarm.dto.member.JoinRequest;
import com.barofarm.barofarm.dto.member.LoginRequest;
import com.barofarm.barofarm.dto.member.MemberAddressDTO;
import com.barofarm.barofarm.dto.member.MyInfoDTO;
import com.barofarm.barofarm.dto.member.MyInfoResponse;
import com.barofarm.barofarm.dto.member.PurchaseHistoryDTO;
import com.barofarm.barofarm.dto.salesBoard.QnaDTO;
import com.barofarm.barofarm.dto.salesBoard.ReviewDTO;
import com.barofarm.barofarm.repository.MemberRepository;
import com.barofarm.barofarm.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {
	
	private final MemberService memberService;
	
	
	@GetMapping("/me")
	public ResponseEntity<?> myInfo(@AuthenticationPrincipal CustomUserDetails user) {
		
		MyInfoResponse myInfo = memberService.getMyInfo(user);
		
		return ResponseEntity.ok(myInfo);
	}
	
	@GetMapping("/mywish")
	public ResponseEntity<?> myWish(@AuthenticationPrincipal CustomUserDetails user){
		
		List<GoodDTO> good = memberService.getMyWishList(user.getUsername());
		
		return ResponseEntity.ok(good);
	}
	
	@GetMapping("/myaddr")
	public ResponseEntity<?> myAddress(@AuthenticationPrincipal CustomUserDetails user){
		
		List<MemberAddressDTO> address = memberService.getMyShipAddress(user.getUsername());
		
		return ResponseEntity.ok(address);
	}
	
	@GetMapping("/myreview")
	public ResponseEntity<?> myReview(
			@AuthenticationPrincipal CustomUserDetails user,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size){
		
		Page<ReviewDTO> review = memberService.getMyReview(user.getUsername(),page,size);
		
		return ResponseEntity.ok(review);
	}
	
	@GetMapping("/myqna")
	public ResponseEntity<?> myQna(@AuthenticationPrincipal CustomUserDetails user){
		
		List<QnaDTO> qna = memberService.getMyQna(user.getUsername());
		
		return ResponseEntity.ok(qna);
	}
	
	@GetMapping("/myorders")
	public ResponseEntity<?> myOrders(
			@AuthenticationPrincipal CustomUserDetails user,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false)
	        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	        LocalDate startDate,
	        @RequestParam(required = false)
	        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	        LocalDate endDate){
		
		Page<PurchaseHistoryDTO> orders = memberService
				.getMyOrders(user.getUsername(),page,size,startDate,endDate);
		
		return ResponseEntity.ok(orders);
	}
	
	@DeleteMapping("/delallwish")
	public ResponseEntity<?> deleteAllWishes(@AuthenticationPrincipal CustomUserDetails user) {
		
		memberService.deleteAllWishList(user.getUsername());
		
		return ResponseEntity.noContent().build();
	}
	
	@DeleteMapping("/delonewish/{goodId}")
	public ResponseEntity<?> deleteOneWish(@PathVariable int goodId){
		
		memberService.deleteOneWish(goodId);
		
		return ResponseEntity.noContent().build();
	}
	
	@PutMapping("/changeinfo")
    public ResponseEntity<?> changeInfo(@Validated @RequestBody JoinRequest req,
    		@AuthenticationPrincipal CustomUserDetails user){
	
		memberService.updateUser(req, user.getUsername());
		
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/confirmpwd")
	public ResponseEntity<?> confirmPwd(@RequestBody LoginRequest req,
			@AuthenticationPrincipal CustomUserDetails user) {
		req.setUserId(user.getUsername());
		
		memberService.confirmPassword(req);
		
		return ResponseEntity.ok().build();
	}
	
	@PutMapping("/changepwd")
	public ResponseEntity<?> changePwd(@RequestBody LoginRequest req,
			@AuthenticationPrincipal CustomUserDetails user){
		req.setUserId(user.getUsername());
		
		memberService.changepassword(req);
		
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/addaddress")
	public ResponseEntity<?> addAddr(@RequestBody MemberAddressDTO req,
			@AuthenticationPrincipal CustomUserDetails user){
		memberService.addAddress(req, user.getUsername());
		
		return ResponseEntity.ok().build();
	}
	
	@PutMapping("/updateaddress")
	public ResponseEntity<?> updateAddr(@RequestBody MemberAddressDTO req,
			@AuthenticationPrincipal CustomUserDetails user){
		memberService.updateAddress(req, user.getUsername());
		
		return ResponseEntity.ok().build();
	}
	
	@DeleteMapping("/deleteaddress/{addressId}")
	public ResponseEntity<?> deleteAddr(@PathVariable Long addressId){
		
		memberService.deleteAddress(addressId);
		
		return ResponseEntity.ok().build();
	}
	
	@PutMapping("/deleteuser")
	public ResponseEntity<?> deleteUserInfo
		(@AuthenticationPrincipal CustomUserDetails user) {
		
		memberService.deleteUser(user.getUsername());
		
		return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
	}
	
	@GetMapping("/myorders/{numPurG}")
	public ResponseEntity<BuyerOrderDetailDTO> getMyOrderDetail(
			@AuthenticationPrincipal CustomUserDetails user,
			@PathVariable int numPurG){
		BuyerOrderDetailDTO dto = memberService.getMyOrderDetail(user.getUsername(), numPurG);
		
		return ResponseEntity.ok(dto);
	}
	
	@PutMapping("/updatemyorder")
	public ResponseEntity<?> refundRequest(
			@RequestParam int numPurD,
			@RequestParam(required = false) String refundReason,
			@RequestParam String status,
			@AuthenticationPrincipal CustomUserDetails user) {
		memberService.updateMyOrderStatus(numPurD, status, refundReason, user.getUsername());
		
		return ResponseEntity.ok().build();
	}
}
