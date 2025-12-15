package com.barofarm.barofarm.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.barofarm.barofarm.entity.KamisDailyEntity;
import com.barofarm.barofarm.repository.KamisDailyRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EasyPriceService {

    private final KamisDailyRepository kamisDailyRepository;

    @Value("${kamis.api.api-key}")
    private String API_KEY;
    
    @Value("${kamis.api.api-id}")
    private String API_ID;

    private static final String BASE_URL = "https://www.kamis.or.kr/service/price/xml.do";

    private final ObjectMapper objectMapper = new ObjectMapper();

    // -------------------------------------------------------------------------
    //  DAILY (recentlyPriceTrendList)
    // -------------------------------------------------------------------------
    public Map<String, Object> getDailyPrice(String productName, LocalDate regday, String clsCode) throws Exception {

        // 1) DB에서 productNo 조회
        KamisDailyEntity entity = kamisDailyRepository
            .findFirstByItemNameAndProductClsCodeOrderByLastestDateDesc(productName, clsCode)
            .orElseThrow(() -> new IllegalArgumentException("상품 없음: " + productName));

        String productNo = entity.getProductNo();

        // 2) API URL 구성
        String uri = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("action", "recentlyPriceTrendList")
                .queryParam("p_productno", productNo)
                .queryParam("p_regday", regday.toString())
                .queryParam("p_cert_key", API_KEY)
                .queryParam("p_cert_id", API_ID)
                .queryParam("p_returntype", "json")
                .toUriString();

        RestTemplate rest = new RestTemplate();
        String body = rest.getForObject(uri, String.class);

        JsonNode root = objectMapper.readTree(body);
        JsonNode priceArray = root.path("price");

        if (!priceArray.isArray() || priceArray.size() == 0) {
           throw new IllegalArgumentException("Kamis 일별 데이터 없음");
        }

        JsonNode today = priceArray.get(0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("productName", productName);
        result.put("productNo", productNo);
        result.put("regday", regday.toString());
        result.put("yyyy", today.path("yyyy").asText());
        result.put("d0", today.path("d0").asText());
        result.put("d10", today.path("d10").asText());
        result.put("d20", today.path("d20").asText());
        result.put("d30", today.path("d30").asText());
        result.put("d40", today.path("d40").asText());
        result.put("mx", today.path("mx").asText());
        result.put("mn", today.path("mn").asText());
        
        return result;
    }

    // -------------------------------------------------------------------------
    //  MONTHLY (monthlyPriceTrendList)
    // -------------------------------------------------------------------------
    public Map<String, Object> getMonthlyPrice(String productName, String regday, String clsCode) throws Exception {

        KamisDailyEntity entity = kamisDailyRepository
                .findFirstByItemNameAndProductClsCodeOrderByLastestDateDesc(productName, clsCode)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음: " + productName));

        String productNo = entity.getProductNo();

        String uri = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("action", "monthlyPriceTrendList")
                .queryParam("p_productno", productNo)
                .queryParam("p_regday", regday)
                .queryParam("p_cert_key", API_KEY)
                .queryParam("p_cert_id", API_ID)
                .queryParam("p_returntype", "json")
                .toUriString();

        RestTemplate rest = new RestTemplate();
        String body = rest.getForObject(uri, String.class);

        JsonNode root = objectMapper.readTree(body);
        JsonNode priceArray = root.path("price");

        List<Map<String, Object>> list = new ArrayList<>();

        if (priceArray.isArray()) {
            for (JsonNode node : priceArray) {
                String yyyymm = node.path("yyyymm").asText();
                if (yyyymm == null || yyyymm.isEmpty()) continue;

                Map<String, Object> map = new LinkedHashMap<>();
                map.put("yyyymm", yyyymm);
                map.put("max", node.path("max").asText());
                map.put("min", node.path("min").asText());
                list.add(map);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("productName", productName);
        result.put("productNo", productNo);
        result.put("regday", regday);
        result.put("data", list);

        return result;
    }

    // -------------------------------------------------------------------------
    //  YEARLY (yearlyPriceTrendList)
    // -------------------------------------------------------------------------
    public Map<String, Object> getYearlyPrice(String productName, String regday, String clsCode) throws Exception {

        KamisDailyEntity entity = kamisDailyRepository
                .findFirstByItemNameAndProductClsCodeOrderByLastestDateDesc(productName, clsCode)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음: " + productName));

        String productNo = entity.getProductNo();

        String uri = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("action", "yearlyPriceTrendList")
                .queryParam("p_productno", productNo)
                .queryParam("p_regday", regday)
                .queryParam("p_cert_key", API_KEY)
                .queryParam("p_cert_id", API_ID)
                .queryParam("p_returntype", "json")
                .toUriString();

        RestTemplate rest = new RestTemplate();
        String body = rest.getForObject(uri, String.class);

        JsonNode root = objectMapper.readTree(body);
        JsonNode priceArray = root.path("price");

        List<Map<String, Object>> list = new ArrayList<>();

        if (priceArray.isArray()) {
            for (JsonNode node : priceArray) {
                String yyyy = node.path("yyyy").asText();
                if (yyyy == null || yyyy.isEmpty()) continue;

                Map<String, Object> map = new LinkedHashMap<>();
                map.put("yyyy", yyyy);
                map.put("max", node.path("max").asText());
                map.put("min", node.path("min").asText());
                list.add(map);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("productName", productName);
        result.put("productNo", productNo);
        result.put("regday", regday);
        result.put("data", list);

        return result;
    }
}
