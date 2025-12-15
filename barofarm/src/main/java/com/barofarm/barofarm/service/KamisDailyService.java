package com.barofarm.barofarm.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.barofarm.barofarm.entity.KamisDailyEntity;
import com.barofarm.barofarm.repository.KamisDailyRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KamisDailyService {

    private final KamisDailyRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    //파싱함수만들어놓기
    private Integer parseIntSafe(String value) {
        try {
            if(value == null) return 0;
            value = value.trim();
            if(value.isEmpty() || "-".equals(value)) return 0 ;

            value = value.replace(",", "");

            return Integer.parseInt(value);
        } catch (Exception e) {
            System.out.println("dpr 파싱실패: " + value);
            return 0;
        }
    }

    private static final String[] CATEGORY_CODES = {"100", "200", "300", "400"};
    private static final Set<String> CATEGORY_SET = new HashSet<>(Arrays.asList(CATEGORY_CODES));

   
    @Value("${kamis.api.api-key}")
    private String API_KEY;
    
    @Value("${kamis.api.api-id}")
    private String API_ID;



    private static final String BASE_URL =
            "http://www.kamis.co.kr/service/price/xml.do?action=dailySalesList"
                    + "&p_cert_key=%s"
                    + "&p_cert_id=%s"
                    + "&p_returntype=json";

   @PostConstruct
   public void init() {
       updateKamisDailyEntity();
   }

    @Scheduled(cron = "0 0 6 * * ?")  // 매일 오전 6시
    public void updateKamisDailyEntity() {

    LocalDate today = LocalDate.now();
    String todayStr = today.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    System.out.println("📌 시작: 금일 가격 업데이트 = " + todayStr);

    // 🔥 7일 전 데이터 삭제
    LocalDate deleteBefore = today.minusDays(7);
    String deleteBeforeStr = deleteBefore.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

    List<KamisDailyEntity> oldData = repository.findByLastestDateBefore(deleteBeforeStr);
    if (!oldData.isEmpty()) {
        repository.deleteAll(oldData);
        System.out.println("🗑 삭제됨: " + oldData.size() + "건 / 날짜 < " + deleteBeforeStr);
    }

    try {
        // dailySalesList API 호출 → 소매(01) + 도매(02) 모두 포함됨
        List<KamisDailyEntity> apiData = fetchData();

        for (KamisDailyEntity dp : apiData) {

            if(!CATEGORY_SET.contains(dp.getCategoryCode())) continue;

            List<KamisDailyEntity> exists =
                    repository.findByProductNoAndProductClsCodeAndLastestDate(
                            dp.getProductNo(),
                            dp.getProductClsCode(),
                            dp.getLastestDate()
                    );

            if (!exists.isEmpty()) {
                KamisDailyEntity existing = exists.get(0);

                existing.setDpr1(dp.getDpr1());
                existing.setDpr2(dp.getDpr2());
                existing.setDpr3(dp.getDpr3());
                existing.setDpr4(dp.getDpr4());
                existing.setDirection(dp.getDirection());
                existing.setValue(dp.getValue());

                existing.setCategoryName(dp.getCategoryName());
                existing.setProductName(dp.getProductName());
                existing.setItemName(dp.getItemName());
                existing.setUnit(dp.getUnit());
                existing.setResultCode(dp.getResultCode());

                repository.save(existing);
            } else {
                repository.save(dp);
            }
        }

        System.out.println("✔ 저장 완료");

    } catch (Exception e) {
        System.err.println("❌ API 오류: " + e.getMessage());
    }
}


   private List<KamisDailyEntity> fetchData() throws Exception {

    String url = String.format(BASE_URL, API_KEY, API_ID);
    System.out.println("📡 요청 URL = " + url);

    RestTemplate restTemplate = new RestTemplate(new HttpComponentsClientHttpRequestFactory());
    HttpHeaders headers = new HttpHeaders();
    headers.add("User-Agent", "Mozilla/5.0");

    ResponseEntity<String> res = restTemplate.exchange(
            url,
            HttpMethod.GET,
            new HttpEntity<>(headers),
            String.class
    );

    JsonNode root = objectMapper.readTree(res.getBody());

    // 오류코드 체크
    if (!"000".equals(root.path("error_code").asText())) {
        System.out.println("⚠ API error_code = " + root.path("error_code").asText());
        return new ArrayList<>();
    }

    JsonNode items = root.path("price");
    if (!items.isArray()) {
        return new ArrayList<>();
    }

    List<KamisDailyEntity> list = new ArrayList<>();

 for (JsonNode item : items) {

    // 카테고리 필터
    String categoryCode = item.path("category_code").asText();
    if(!CATEGORY_SET.contains(categoryCode)) continue;

    KamisDailyEntity dp = new KamisDailyEntity();

    dp.setCategoryCode(item.path("category_code").asText());
    dp.setCategoryName(item.path("category_name").asText());
    
    dp.setProductClsCode(item.path("product_cls_code").asText());
    dp.setProductClsName(item.path("product_cls_name").asText());

    dp.setProductNo(item.path("productno").asText());
    dp.setLastestDate(item.path("lastest_day").asText());

    dp.setProductName(item.path("productName").asText());
    dp.setItemName(item.path("item_name").asText());
    dp.setUnit(item.path("unit").asText());

    dp.setDay1(item.path("day1").asText());
    dp.setDpr1(parseIntSafe(item.path("dpr1").asText()));

    dp.setDay2(item.path("day2").asText());
    dp.setDpr2(parseIntSafe(item.path("dpr2").asText()));

    dp.setDay3(item.path("day3").asText());
    dp.setDpr3(parseIntSafe(item.path("dpr3").asText()));

    dp.setDay4(item.path("day4").asText());
    dp.setDpr4(parseIntSafe(item.path("dpr4").asText()));

    dp.setDirection(item.path("direction").asText());
    dp.setValue(item.path("value").asDouble());

    dp.setResultCode(item.path("resultCode").asText());

    list.add(dp);
}


    return list;
}

}
