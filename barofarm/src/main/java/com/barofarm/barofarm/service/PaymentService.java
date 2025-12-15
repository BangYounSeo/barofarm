package com.barofarm.barofarm.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.barofarm.barofarm.dto.OrderRequestDTO;
import com.barofarm.barofarm.dto.OrderResponseDTO;
import com.barofarm.barofarm.Enum.PurchaseDetailStatus;
import com.barofarm.barofarm.Enum.TransactionType;
import com.barofarm.barofarm.dto.OrderItemDTO;
import com.barofarm.barofarm.dto.PaymentConfirmDTO;
import com.barofarm.barofarm.dto.PaymentVerifyResponseDTO;
import com.barofarm.barofarm.entity.*;
import com.barofarm.barofarm.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import kotlinx.serialization.json.JsonObject;
import lombok.RequiredArgsConstructor;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PaymentService {


    private final MemberRepository memberRepository;
    private final PurchaseGroupRepository purchaseGroupRepository;
    private final PurchaseDetailRepository purchaseDetailRepository;
    private final SalesOptionDetailRepository optionDetailRepository;
    private final CartRepository cartRepository;
    private final PaymentRepository paymentRepository;
    private final SalesBoardRepository salesBoardRepository;
    private final  PlatformAccountRepository platformAccountRepository;
    private final  PlatformAmountTransactionRepository platformAmountTransactionRepository;
    private final CancelPaymentDataRepository cancelPaymentDataRepository;

    /*============================================================
    🔥 PortOne 결제 검증 API 호출 수정됨 (인증 방식 변경!)
============================================================*/
@Value("${portone.api-secret}") // ⭐ 추가: API Secret 사용
private String apiSecret;

@Value("${portone.webhook-secret}")
    private String webhookSecret; 

    @Transactional
public PaymentVerifyResponseDTO verifyPayment(String paymentId) {

    String url = "https://api.portone.io/payments/" + paymentId;
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "PortOne " + apiSecret);
    headers.setContentType(MediaType.APPLICATION_JSON);

    RestTemplate restTemplate = new RestTemplate();
    ResponseEntity<String> response;

    try {
        response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
    } catch (Exception e) {
        // PortOne API 호출 실패 → 조용히 종료
        return null;
    }

    ObjectMapper mapper = new ObjectMapper();

    try {
        JsonNode root = mapper.readTree(response.getBody());

        String status = root.path("status").asText();
        int amount = root.path("amount").path("total").asInt();
        String currency = root.path("currency").asText();
        String approvedAtStr = root.path("paidAt").asText();

        LocalDateTime approvedAt;
        try {
            approvedAt = OffsetDateTime.parse(approvedAtStr, DateTimeFormatter.ISO_OFFSET_DATE_TIME).toLocalDateTime();
        } catch (Exception e) {
            approvedAt = LocalDateTime.parse(approvedAtStr, DateTimeFormatter.ISO_DATE_TIME);
        }

        String method = root.path("method").asText();
        String transactionId = root.path("transactionId").asText();
        String receiptUrl = root.has("receiptUrl") ? root.get("receiptUrl").asText() : null;

        // 주문 그룹
        PurchaseGroup pg = purchaseGroupRepository.findByMerchantUid(paymentId)
                .orElse(null);

        if (pg == null) {
            return null; // 조용히 취소
        }

        JsonNode customerNode = root.path("customer");
        PaymentVerifyResponseDTO.CustomerInfo customer = null;
        if (!customerNode.isMissingNode() && !customerNode.isNull()) {
            customer = PaymentVerifyResponseDTO.CustomerInfo.builder()
                    .name(customerNode.path("name").asText(null))
                    .email(customerNode.path("email").asText(null))
                    .phone(customerNode.path("phone").asText(null))
                    .build();
        }

        JsonNode cardNode = root.path("card");
        PaymentVerifyResponseDTO.CardInfo card = null;
        if (!cardNode.isMissingNode() && !cardNode.isNull()) {
            card = PaymentVerifyResponseDTO.CardInfo.builder()
                    .number(cardNode.path("number").asText(null))
                    .issuer(cardNode.path("issuer").asText(null))
                    .installments(cardNode.path("installments").asInt(0))
                    .isInterestFree(cardNode.path("isInterestFree").asBoolean(false))
                    .approvedAt(cardNode.path("approvedAt").asText(null))
                    .build();
        }

        // DB 저장
        Payment entity = new Payment();
        entity.setPaymentId(paymentId);
        entity.setStatus(status);
        entity.setAmount(amount);
        entity.setCurrency(currency);
        entity.setApprovedAt(approvedAt);
        entity.setMethod(method);
        entity.setTransactionId(transactionId);
        entity.setReceiptUrl(receiptUrl);
        entity.setPurchaseGroup(pg);

        if (customer != null) {
            entity.setCustomerName(customer.getName());
            entity.setCustomerEmail(customer.getEmail());
            entity.setCustomerPhone(customer.getPhone());
        }

        if (card != null) {
            entity.setCardNumber(card.getNumber());
            entity.setCardIssuer(card.getIssuer());
            entity.setCardInstallments(card.getInstallments());
            entity.setCardIsInterestFree(card.isInterestFree());
            entity.setCardApprovedAt(card.getApprovedAt());
        }

        paymentRepository.saveAndFlush(entity);

        // 성공이면 DTO 리턴
        return PaymentVerifyResponseDTO.builder()
                .paymentId(paymentId)
                .status(status)
                .amount(amount)
                .currency(currency)
                .approvedAt(approvedAt)
                .method(method)
                .transactionId(transactionId)
                .receiptUrl(receiptUrl)
                .customer(customer)
                .card(card)
                .build();

    } catch (Exception e) {
        // 여기서도 조용히 취소
        return null;
    }
}



    /*============================================================
        🔥 결제 성공 후 DB 업데이트 (PurchaseGroup 상태 변경)
    ============================================================*/
    @Transactional
    public void setPaid(String merchantUid,String type) {

        PurchaseGroup pg = purchaseGroupRepository.findByMerchantUid(merchantUid)
                .orElseThrow(() -> new RuntimeException("주문 정보가 존재하지 않습니다."));

        System.out.println(pg);

        List<PurchaseDetail> pd = purchaseDetailRepository.findAllByPurchaseGroup_NumPurG(pg.getNumPurG());

        System.out.println(pd);
        PlatformAccount pa = platformAccountRepository.findById(1L).get();

        System.out.println(pa);
        
        for(PurchaseDetail item : pd){

            PlatformAmountTransaction pat = new PlatformAmountTransaction();

            pat.setType(TransactionType.valueOf(item.getStatus().name()));
            pat.setAmount(item.getFinalPrice());
            pat.setBalanceAfter(item.getFinalPrice()+pa.getBalance());
            pat.setPurchaseDetail(item);
            pat.setMemo("구매완료");

           SalesOptionDetail optionDetail =  item.getSalesOptionDetail();
           optionDetail.setStock(optionDetail.getStock()-item.getQuantity());

           platformAmountTransactionRepository.save(pat);

           // 🔥 장바구니 구매였으면 장바구니 비우기
        if(type.equals("cart")){
           cartRepository.deleteByMember_UserIdAndSalesOptionDetail_NumOptD(
        pg.getMember().getUserId(),
        optionDetail.getNumOptD()
);
        }

        }


        pg.setStatus("PAID");
        purchaseGroupRepository.save(pg);

        
        
    }


    
    /*============================================================
        🔥 주문 생성 API (기존 그대로)
    ============================================================*/
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO req) {

        Member member = memberRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다."));

        

        PurchaseGroup pg = new PurchaseGroup();
        pg.setMember(member);
        pg.setMerchantUid(req.getMerchantUid());
        pg.setTotalPrice(req.getTotalPrice());
        pg.setOrderDate(LocalDateTime.now());
        pg.setStatus("readypay");

        pg.setReceiverName(req.getReceiverName());
        pg.setReceiverPhone(req.getReceiverPhone());
        pg.setReceiverPostalCode(req.getReceiverPostalCode());
        pg.setReceiverAddr1(req.getReceiverAddr1());
        pg.setReceiverAddr2(req.getReceiverAddr2());

        purchaseGroupRepository.save(pg);

         // 모든 주문 아이템 처리
    for (OrderItemDTO item : req.getItems()) {
        PurchaseDetail detail = new PurchaseDetail();
        detail.setPurchaseGroup(pg);
        detail.setQuantity(item.getQuantity());
        detail.setFinalPrice((item.getPrice()*item.getQuantity()));
        detail.setUnitPrice(item.getPrice());

        SalesBoard salesBoard = salesBoardRepository.findByNumBrd(item.getNumBrd())
        .orElseThrow(() -> new RuntimeException("옵션을 찾을 수 없습니다."));
        detail.setSalesBoard(salesBoard);

        SalesOptionDetail option = optionDetailRepository.findByNumOptD(item.getNumOptD())
        .orElseThrow(() -> new RuntimeException("옵션을 찾을 수 없습니다."));
        detail.setSalesOptionDetail(option);

        detail.setStatus(PurchaseDetailStatus.PAID);

        purchaseDetailRepository.save(detail);
    }


        return OrderResponseDTO.builder()
                .orderId(req.getMerchantUid())
                .amount(pg.getTotalPrice())
                .orderName("바로팜 상품 주문")
                .customerName(pg.getReceiverName())
                .build();
    }




    @Transactional
    public void confirmPayment(PaymentConfirmDTO req) {
        System.out.println("PG 승인 요청 확인: " + req.getOrderId());
    }
    
    
 // ============================================================
 // 🔍 Webhook JSON 문자열 → Map 변환 유틸
 // ============================================================
 public Map<String, Object> parseWebhook(String body) {
     try {
         ObjectMapper mapper = new ObjectMapper();
         return mapper.readValue(body, Map.class);   // JSON → Map 변환
     } catch (Exception e) {
         throw new RuntimeException("Webhook JSON 파싱 오류");
     }
 }


 @Transactional
 public JsonNode cancelPayment(int numPurD, int quantity, int price, int numOptD, int numPurG,String type) {
 
     // 1. 결제 정보 조회
     Payment payment = paymentRepository.findByNumPurG(numPurG)
             .orElseThrow(() -> new RuntimeException("결제 정보를 찾을 수 없습니다."));
 
     String paymentId = payment.getPaymentId();
     if (paymentId == null || paymentId.isEmpty()) {
         throw new RuntimeException("결제 ID가 없습니다.");
     }
 
     if (apiSecret == null || apiSecret.isEmpty()) {
         throw new RuntimeException("포트원 API Secret이 설정되지 않았습니다.");
     }
 
     // 2. URL + Header
     String url = "https://api.portone.io/payments/" + paymentId + "/cancel";
 
     HttpHeaders headers = new HttpHeaders();
     headers.set("Authorization", "PortOne " + apiSecret);
     headers.setContentType(MediaType.APPLICATION_JSON);
 
     // 3. Body 생성
     Map<String, Object> cancelRequest = new HashMap<>();
     cancelRequest.put("amount", price*quantity);
     cancelRequest.put("reason", "고객 요청에 의한 주문 취소");
 
     ObjectMapper mapper = new ObjectMapper();
     String requestBody;
 
     try {
         requestBody = mapper.writeValueAsString(cancelRequest);
     } catch (Exception e) {
         throw new RuntimeException("취소 요청 생성 실패", e);
     }
 
     // 4. API 호출
     RestTemplate restTemplate = new RestTemplate();
 
     try {
         HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
         ResponseEntity<String> response = restTemplate.exchange(
                 url,
                 HttpMethod.POST,
                 entity,
                 String.class
         );
 
         // 5. 응답 파싱
         String responseBody = response.getBody();
         if (responseBody == null || responseBody.isEmpty()) {
             throw new RuntimeException("포트원에서 응답이 비어 있습니다.");
         }
 
         JsonNode json = mapper.readTree(responseBody);

         System.out.println("포트원 취소 응답 JSON = " + json.toPrettyString());
 
         // 6. 취소 상태 체크
         String status = json.path("status").asText();
 
         if (!status.equalsIgnoreCase("CANCELLED") &&
             !status.equalsIgnoreCase("CANCELED") &&
             !status.equalsIgnoreCase("PARTIAL_CANCELLED") &&   // 일부 취소 가능성
             !status.isEmpty()) {
 
             throw new RuntimeException("포트원 결제 취소 실패: status=" + status);
         }
 

          PurchaseDetail pd = purchaseDetailRepository.findById(numPurD).orElseThrow(() -> new RuntimeException("주문 정보를 찾을 수 없습니다."));
         if (type.equals("CANCEL")) {
    pd.setStatus(PurchaseDetailStatus.CANCEL);

} else if (type.equals("REFUNDED")) {
    pd.setStatus(PurchaseDetailStatus.REFUNDED);
}

             PlatformAccount pa = platformAccountRepository.findById(1L).get();

            PlatformAmountTransaction pat = new PlatformAmountTransaction();

            TransactionType typed;
            if("REFUNDING".equals(pd.getStatus().name())) {
                typed = TransactionType.REFUNDED; // 혹은 적절한 매핑
            } else {
                typed = TransactionType.valueOf(pd.getStatus().name());
            }
            pat.setType(typed);
            pat.setAmount(pd.getFinalPrice());
            pat.setBalanceAfter(pa.getBalance()-pd.getFinalPrice());
            pat.setPurchaseDetail(pd);
            if(type.equals("CANCEL")){
                pat.setMemo("구매취소");
            }else if(type.equals("REFUNDED")){
                pat.setMemo("환불사유 : "+pd.getRefundReason());
            }
            
            platformAmountTransactionRepository.save(pat);

           SalesOptionDetail optionDetail =  pd.getSalesOptionDetail();
           optionDetail.setStock(optionDetail.getStock()+pd.getQuantity());



            PurchaseGroup pg = purchaseGroupRepository.findById(numPurG).orElseThrow(() -> new RuntimeException("주문 정보가 존재하지 않습니다."));

            List<PurchaseDetail> details = pg.getPurchaseDetails();
            
            int cancel = 0;
            int refund = 0;
            int other = 0;
            String result;

            for(PurchaseDetail p : details){

                System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            System.out.println(p.getStatus());
            System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                if (p.getStatus() == PurchaseDetailStatus.CANCEL) {
                    cancel++;
                } else if (p.getStatus() == PurchaseDetailStatus.REFUNDED) {
                    refund++;
                } else {
                    other++;
                }

                System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            System.out.println("cancel:" +cancel + "refund" + refund + "other" + other);
            System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            }

            if (cancel > 0 && refund ==0 && other ==0) {
                result = "CANCEL";
            }else if(refund > 0 && cancel ==0 && other==0){
                result = "REFUNDED";
            }else if (refund > 0 && cancel > 0 && other > 0){
                result = "PARTIAL_CANCELLATION_REFUND";
            }else if (refund > 0 && cancel > 0 && other == 0){
                result = "CANCELLATION_REFUND";
            }else if (cancel > 0 && refund ==0 && other >0){
                result = "PARTIAL_CANCELLATION";
            }else if (cancel == 0 && refund > 0 && other >0){
                result = "PARTIAL_REFUND";
            }else{
                result = pg.getStatus();
            }

            pg.setStatus(result);

            purchaseGroupRepository.save(pg);


         savePaymentFromPortOne(json,type);
         // 7. 응답 전체 반환
         return json;
 
     } catch (Exception e) {
         throw new RuntimeException("포트원 API 호출 또는 파싱 오류: " + e.getMessage(), e);
     }
 }





public CancelPaymentData savePaymentFromPortOne(JsonNode json,String type) {

    JsonNode cancel = json.path("cancellation");  // ★ 핵심

    CancelPaymentData payment = new CancelPaymentData();


    

    // 기본 정보
    payment.setPaymentId(cancel.path("id").asText());
    payment.setMerchantId(cancel.path("pgCancellationId").asText()); // 없으면 다른 필드 지정 가능

    if(type.equals("CANCEL")){
    payment.setStatus("CANCEL");
    }else if(type.equals("REFUNDED")){
    payment.setStatus("REFUNDED");
    }
    
    payment.setMethod(cancel.path("trigger").asText()); // method field로 trigger 값 사용

    // 금액
    payment.setAmount(cancel.path("totalAmount").asInt(0));
    payment.setCancelledAmount(cancel.path("totalAmount").asInt(0)); // 전체 취소면 같음
    payment.setBalanceAmount(0); // 취소 후 미사용 금액 → 필요하면 계산 로직 추가

    // 날짜
    DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    if (!cancel.path("cancelledAt").isNull() && !cancel.path("cancelledAt").asText().isEmpty()) {
        payment.setApprovedAt(
                OffsetDateTime.parse(cancel.path("cancelledAt").asText(), formatter)
                        .toLocalDateTime()
        );
    }

    if (!cancel.path("requestedAt").isNull() && !cancel.path("requestedAt").asText().isEmpty()) {
        payment.setPaidAt(
                OffsetDateTime.parse(cancel.path("requestedAt").asText(), formatter)
                        .toLocalDateTime()
        );
    }

    return cancelPaymentDataRepository.save(payment);
}

 
}
