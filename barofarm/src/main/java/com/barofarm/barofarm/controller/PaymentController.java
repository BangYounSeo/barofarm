package com.barofarm.barofarm.controller;

import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.barofarm.barofarm.dto.AddressOnly;
import com.barofarm.barofarm.dto.OrderRequestDTO;
import com.barofarm.barofarm.dto.OrderResponseDTO;
import com.barofarm.barofarm.dto.PaymentCancelRequestDTO;
import com.barofarm.barofarm.dto.PaymentConfirmDTO;
import com.barofarm.barofarm.dto.PaymentVerifyResponseDTO;
import com.barofarm.barofarm.entity.MemberAddress;
import com.barofarm.barofarm.repository.MemberAddressRepository;
import com.barofarm.barofarm.repository.MemberRepository;
import com.barofarm.barofarm.service.MemberAddressService;
import com.barofarm.barofarm.service.PaymentService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.util.Base64;
import java.util.List;
import java.nio.charset.StandardCharsets;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final MemberAddressRepository addressRepository;
    private final MemberAddressService addressService;
    

    // 📌 application.yml에서 Webhook Secret 불러오기
    @Value("${portone.webhook-secret}")
    private String webhookSecret;

    /* ================================
       🔥 주문 생성 (상세 or 장바구니)
       POST /api/payment/order
    ================================= */
    @PostMapping("/order")
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody OrderRequestDTO req) {

        System.out.println("[POST] /api/payment/order 요청 수신");

        OrderResponseDTO response = paymentService.createOrder(req);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/getAdd/{userId}")
    public List<AddressOnly> getAddresses(@PathVariable String userId) {

        return addressRepository.findAddressOnlyByUserId(userId);


    }

    // 새로운 주소 저장
    @PostMapping("/setAdd/{userId}")
    public ResponseEntity<MemberAddress> saveAddress(
            @PathVariable String userId,
            @RequestBody MemberAddress address
    ) {

        MemberAddress saved = addressService.saveAddress(userId, address);
        return ResponseEntity.ok(saved);
    }

    // 기본 배송지 설정
    @PutMapping("/{userId}/default/{addressId}")
    public String setDefaultAddress(@PathVariable String userId, @PathVariable Long addressId) {
        addressService.setDefaultAddress(userId, addressId);
        return "success";
    }

    // 주소 삭제
    @DeleteMapping("/{userId}/{addressId}")
    public String deleteAddress(@PathVariable String userId, @PathVariable Integer addressId) {
        addressService.deleteAddress(userId, addressId);
        return "success";
    }

    @PostMapping("/cancel")
public ResponseEntity<?> cancelPayment(@RequestBody PaymentCancelRequestDTO request) {

    try {
        JsonNode responseData = paymentService.cancelPayment(
                request.getNumPurD(),
                request.getQuantity(),
                request.getPrice(),
                request.getNumOptD(),
                request.getNumPurG(),
                request.getType()
        );

        return ResponseEntity.ok(responseData);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("주문 취소 실패: " + e.getMessage());
    }
}


    /* ================================
       🔥 결제 승인 처리 (PG Callback)
       POST /api/payment/confirm
    ================================= */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody PaymentConfirmDTO req) {

        System.out.println("[POST] /api/payment/confirm 요청 수신");

        paymentService.confirmPayment(req);

        return ResponseEntity.ok("결제 승인 완료");
    }

    /* ================================
       🔥 결제 서버 검증 처리       
    ================================= */
    
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestParam String paymentId,@RequestParam String type) {

        System.out.println("🔥 verifyPayment 컨트롤러 진입 - " + paymentId);

        if (paymentId == null) {
            throw new IllegalArgumentException("paymentId 가 없습니다.");
        }
        if (type == null) {
            throw new IllegalArgumentException("type 가 없습니다.");
        }
        // 1) PortOne 서버에 결제 검증
        PaymentVerifyResponseDTO result = paymentService.verifyPayment(paymentId);

        // 2) 우리 DB 주문 상태 변경
        //    현재 구조에서는 paymentId == merchantUid 이므로 그대로 사용 가능
        paymentService.setPaid(paymentId,type);   // ⭐ 한 번만 호출

        return ResponseEntity.ok(result);
    }

   @RequestMapping(value = "/successMobile", method = {RequestMethod.GET, RequestMethod.POST})
public ResponseEntity<?> paymentSuccess(
        @RequestParam String paymentId,
        @RequestParam String type,
        @RequestParam String orderDataJson
) throws JsonProcessingException {

    ObjectMapper mapper = new ObjectMapper();
    OrderRequestDTO orderRequest = mapper.readValue(orderDataJson, OrderRequestDTO.class);

    System.out.println("🔥 verifyPayment 컨트롤러 진입 - " + paymentId);

     if (paymentId == null) {
            throw new IllegalArgumentException("paymentId 가 없습니다.");
        }
        if (type == null) {
            throw new IllegalArgumentException("type 가 없습니다.");
        }

    paymentService.createOrder(orderRequest);

    // PortOne 검증
    PaymentVerifyResponseDTO result = paymentService.verifyPayment(paymentId);

    // ❌ 검증 실패 → 뒤로가기
    if (result == null) {
        String html =
        "<script>" +
        "location.replace('/paymentDetail');" +
        "</script>";

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.TEXT_HTML);
    return new ResponseEntity<>(html, headers, HttpStatus.OK);
    }

    paymentService.setPaid(paymentId, type); // ⭐ 한 번만 호출

    HttpHeaders headers = new HttpHeaders();
    headers.add("Location", "/payment/success?paymentId=" + paymentId); 
    return new ResponseEntity<>(headers, HttpStatus.FOUND);
}


    
    /* ============================================================
    🔔 Webhook 결제 결과 수신 (PortOne → 우리서버)
    📌 Webhook Secret HMAC SHA-256 + Base64 URL Safe 검증
    ============================================================ */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestHeader(name = "Portone-Signature", required = false) String signature1,
            @RequestHeader(name = "x-portone-signature", required = false) String signature2,
            @RequestBody String body) {

        String signature = (signature1 != null) ? signature1 : signature2;

        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec =
                    new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(keySpec);

            // 🔥 수정됨: Base64 URL Safe Encoding + padding 제거!
            String expectedSignature = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hmac.doFinal(body.getBytes(StandardCharsets.UTF_8)));

            if (!expectedSignature.equals(signature)) {
                System.out.println("❌ Webhook Signature mismatch");
                System.out.println("📌 expected = " + expectedSignature);
                System.out.println("📌 received = " + signature);
                return ResponseEntity.status(401).body("Invalid Signature");
            }

            System.out.println("🔐 Webhook Signature 검증 완료");

            Map<String, Object> payload = paymentService.parseWebhook(body);
            Map<String, Object> payment = (Map<String, Object>) payload.get("payment");

            String paymentId = (String) payment.get("id");
            String status = (String) payment.get("status");

            System.out.println("📌 paymentId = " + paymentId);
            System.out.println("📌 status = " + status);

            if ("PAID".equalsIgnoreCase(status)) {
            }

            return ResponseEntity.ok("Webhook OK");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Webhook Error");
        }
    }
 
    		
}
