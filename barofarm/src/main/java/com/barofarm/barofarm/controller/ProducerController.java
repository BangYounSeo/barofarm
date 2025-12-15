package com.barofarm.barofarm.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.member.BizVerifyRequest;
import com.barofarm.barofarm.dto.member.BizVerifyResult;
import com.barofarm.barofarm.dto.member.CustomUserDetails;
import com.barofarm.barofarm.dto.member.ProducerDTO;
import com.barofarm.barofarm.dto.member.ProducerDashboardResponse;
import com.barofarm.barofarm.dto.member.ProducerMainResponse;
import com.barofarm.barofarm.dto.member.SettlementResponse;
import com.barofarm.barofarm.dto.salesBoard.ProducerJoinRequest;
import com.barofarm.barofarm.entity.PurchaseDetail;
import com.barofarm.barofarm.entity.PurchaseGroup;
import com.barofarm.barofarm.repository.PurchaseDetailRepository;
import com.barofarm.barofarm.service.MemberService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/producer")
public class ProducerController {

	private final MemberService memberService;
	private final PurchaseDetailRepository purchaseDetailRepository;
	
	@PostMapping("/join")
	public ResponseEntity<?> joinProducer(@Validated @RequestBody ProducerJoinRequest req, BindingResult bindingResult,
			@AuthenticationPrincipal CustomUserDetails user) {

		if (bindingResult.hasErrors()) {
			return ResponseEntity.badRequest()
					.body("입력값이 올바르지 않습니다.");
		}

		memberService.joinProducer(req, user.getUsername());

		return ResponseEntity.ok("판매자 등록 완료");
	}

	@PostMapping("/verifybiz")
	public ResponseEntity<?> verifyBiz

	(@Validated @RequestBody BizVerifyRequest req, BindingResult bindingResult) {

		if (bindingResult.hasErrors()) {
			return ResponseEntity.badRequest()
					.body("입력값이 올바르지 않습니다.");
		}

		BizVerifyResult res = memberService.verify(req);

		if (!"01".equals(res.getValid())) {
			// 국세청이 "확인할 수 없습니다" 같은 메시지를 valid_msg에 줌
			String msg = res.getValid_msg() != null ? res.getValid_msg() : "국세청 정보와 일치하지 않습니다.";
			return ResponseEntity.status(409).body(msg);
		}

		// 3. 상태코드(폐업, 휴업 등) 체크
		if ("03".equals(res.getStatus().getB_stt_cd())) {
			return ResponseEntity.status(409).body("폐업한 사업자입니다.");
		}

		// 필요하면 data를 그대로 보내거나, 필요한 필드만 골라서 DTO로 감싸서 전송
		return ResponseEntity.ok(res);
	}

	// 판매자 정보 조회 및 수정
	@GetMapping("/profile")
	public ResponseEntity<?> getProfile(@AuthenticationPrincipal CustomUserDetails user) {
		ProducerDTO dto = memberService.getProducerProfile(user.getUsername());
		return ResponseEntity.ok(dto);
	}

	@PutMapping("/profile")
	public ResponseEntity<?> updateProfile(
			@RequestBody ProducerDTO req,
			@AuthenticationPrincipal CustomUserDetails user) {

		memberService.updateProducerProfile(req, user.getUsername());
		return ResponseEntity.ok("수정 완료");
	}

	@GetMapping("/userorders")
	public ResponseEntity<?> getUserOrders(@AuthenticationPrincipal CustomUserDetails user,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {

		Page<ProducerMainResponse> orders = memberService.getUserOrders(user.getUsername(), page, size);

		return ResponseEntity.ok(orders);
	}

	@PutMapping("/orderstatusupdate")
	public ResponseEntity<?> updateOrderStatus(
			@AuthenticationPrincipal CustomUserDetails user,
			@RequestParam int numPurD,
			@RequestParam String status,
			@RequestParam(required = false) String trackingNo) {
		memberService.updateOrderStatus(numPurD, status, trackingNo, user.getUsername());

		return ResponseEntity.ok().build();
	}

	@GetMapping("/getPG")
	public int getPG(@RequestParam int numPurD) {

    PurchaseDetail pd = purchaseDetailRepository.findByNumPurD(numPurD);

    PurchaseGroup pg = pd.getPurchaseGroup();

    return pg.getNumPurG();  // 👉 필요한 필드만 반환
	}
	
	@GetMapping("/getdata")
	public ResponseEntity<?> getDashboardData(
			@AuthenticationPrincipal CustomUserDetails user) {

		ProducerDashboardResponse data = memberService.getDashboardData(user.getUsername());

		return ResponseEntity.ok(data);
	}
	
	@GetMapping("/getsettlement")
	public ResponseEntity<?> getSettlement(
			@AuthenticationPrincipal CustomUserDetails user,
			@RequestParam(required = false) Integer year,
			@RequestParam(required = false) Integer month,
			@RequestParam(required = false) String mode) {
		
		SettlementResponse res = memberService.getSettlement
				(user.getUsername(), year, month, mode);
		
		return ResponseEntity.ok(res);
	}
	
	@GetMapping("/getmyboards")
	public ResponseEntity<?> getMyBoards(@AuthenticationPrincipal CustomUserDetails user,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size){
		Page<SalesBoardDTO> res = memberService.getMyBoards(user.getUsername(), page, size);
		
		return ResponseEntity.ok(res);
	}
	
}
