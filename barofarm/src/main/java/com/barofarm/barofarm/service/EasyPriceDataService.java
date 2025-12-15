package com.barofarm.barofarm.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.barofarm.barofarm.dto.DailyPriceDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EasyPriceDataService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${kamis.api.api-key}")
    private String API_KEY;
    
    @Value("${kamis.api.api-id}")
    private String API_ID;
    private static final Set<String> ALLOWED_CATEGORY_CODES =
        new HashSet<>(Arrays.asList("100","200","300","400"));

   private List<DailyPriceDTO> getPriceDataByCategory(
        String productClsCode,
        String categoryCode,
        String countryCode,
        String regday,
        String convertKgYn,
        String returnType
    ) throws Exception {
    if(!ALLOWED_CATEGORY_CODES.contains(categoryCode)) {
        throw new IllegalArgumentException("지원하지 않는 categoryCode: " + categoryCode);
    }

    String url = buildUrl(productClsCode, categoryCode, countryCode, regday, convertKgYn, returnType);
    System.out.println("👉 호출 URL: " + url);

    RestTemplate restTemplate = new RestTemplate(new HttpComponentsClientHttpRequestFactory());
    HttpHeaders headers = new HttpHeaders();
    headers.add("User-Agent", "Mozilla/5.0");

    ResponseEntity<String> res =
            restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

    String body = res.getBody();

    // 🔥 HTML 응답 방지(KAMIS 302 차단)
    if (body.startsWith("<")) {
        System.out.println("❌ HTML 반환됨 - 요청 제한됨");
        return new ArrayList<>();
    }

    JsonNode root = objectMapper.readTree(body);
    JsonNode data = root.path("data");

    if (!"000".equals(data.path("error_code").asText())) {
        return new ArrayList<>();
    }

    JsonNode items = data.path("item");
    if (!items.isArray()) return new ArrayList<>();

    List<DailyPriceDTO> list = new ArrayList<>();

    for (JsonNode item : items) {
        DailyPriceDTO dto = new DailyPriceDTO();
        dto.setItemName(item.path("item_name").asText());
        dto.setItemCode(item.path("item_code").asText());
        dto.setKindName(item.path("kind_name").asText());
        dto.setKindCode(item.path("kind_code").asText());
        dto.setRank(item.path("rank").asText());
        dto.setRankCode(item.path("rank_code").asText());
        dto.setUnit(item.path("unit").asText());

        dto.setDay1(item.path("day1").asText());
        dto.setDpr1(item.path("dpr1").asText().replace(",", ""));
        dto.setDay2(item.path("day2").asText());
        dto.setDpr2(item.path("dpr2").asText().replace(",", ""));
        dto.setDay3(item.path("day3").asText());
        dto.setDpr3(item.path("dpr3").asText().replace(",", ""));
        dto.setDay4(item.path("day4").asText());
        dto.setDpr4(item.path("dpr4").asText().replace(",", ""));
        dto.setDay5(item.path("day5").asText());
        dto.setDpr5(item.path("dpr5").asText().replace(",", ""));
        dto.setDay6(item.path("day6").asText());
        dto.setDpr6(item.path("dpr6").asText().replace(",", ""));
        dto.setDay7(item.path("day7").asText());
        dto.setDpr7(item.path("dpr7").asText().replace(",", ""));

        dto.setCategoryCode(categoryCode);
        dto.setRegday(regday);
        dto.setProductClsCode(productClsCode);
        dto.setRegionCode(countryCode);

        list.add(dto);
    }

    return list;
}

public List<DailyPriceDTO> getPriceData(
        String productClsCode,
        String countryCode,
        String regday,
        String convertKgYn,
        String returnType
) throws Exception {

    // 🔥 100,200,300,400 전체 조회
    List<String> categories = Arrays.asList("100", "200", "300", "400");

    List<DailyPriceDTO> result = new ArrayList<>();

    for (String categoryCode : categories) {
        List<DailyPriceDTO> partial = getPriceDataByCategory(
                productClsCode,
                categoryCode,
                countryCode,
                regday,
                convertKgYn,
                returnType
        );

        result.addAll(partial);
    }

    return result;
}


    /** 🔥 요청 변수 처리해서 URL 생성 */
    private String buildUrl(
            String productCls,
            String category,
            String country,
            String regday,
            String convertKgYn,
            String returnType
    ) {

        return "http://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList"
                + "&p_product_cls_code=" + productCls
                + "&p_item_category_code=" + category
                + "&p_country_code=" + country
                + "&p_regday=" + regday
                + "&p_convert_kg_yn=" + convertKgYn
                + "&p_returntype=" + returnType
                + "&p_cert_key=" + API_KEY
                + "&p_cert_id=" + API_ID;
    }
}
