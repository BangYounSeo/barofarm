package com.barofarm.barofarm.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.barofarm.barofarm.dto.DailyPriceDTO;
import com.barofarm.barofarm.entity.DailyPrice;
import com.barofarm.barofarm.repository.DailyPriceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SearchDetailService {

    private final DailyPriceRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${kamis.api.api-key}")
    private String API_KEY;
    
    @Value("${kamis.api.api-id}")
    private String API_ID;
    private static final String BASE_URL = "http://www.kamis.or.kr/service/price/xml.do";

    public List<DailyPrice> getDetailSearch(
            String categoryCode,
            String itemName,
            String kindName,
            String regionName,
            String productClsCode
    ) {
        return repository.findByCategoryCodeAndItemNameAndKindNameAndRegionNameAndProductClsCode(
                categoryCode, itemName, kindName, regionName, productClsCode);
    }

    // REGION DATA
    public List<DailyPriceDTO> getLatestRegionData(String categoryCode, String itemCode,
                                                   String kindCode, String productClsCode) {
        List<DailyPrice> entityList = repository.findRgionByCode(
                categoryCode, itemCode, kindCode, productClsCode);

        return entityList.stream()
                .map(e -> new DailyPriceDTO(
                        e.getId(),
                        e.getItemName(),
                        e.getItemCode(),
                        e.getKindName(),
                        e.getKindCode(),
                        e.getRank(),
                        e.getRankCode(),
                        e.getUnit(),
                        e.getDay1(),
                        e.getDpr1(),
                        e.getDay2(),
                        e.getDpr2(),
                        e.getDay3(),
                        e.getDpr3(),
                        e.getDay4(),
                        e.getDpr4(),
                        e.getDay5(),
                        e.getDpr5(),
                        e.getDay6(),
                        e.getDpr6(),
                        e.getDay7(),
                        e.getDpr7(),
                        e.getCategoryCode(),
                        e.getRegday(),
                        e.getProductClsCode(),
                        e.getRegionCode(),
                        e.getRegionName()
                ))
                .collect(Collectors.toList());
    }



    // ----------------------------------
    //           YEARLY API
    // ----------------------------------
    public String fetchYearlySalesListData(String yyyy, String categoryCode, String itemCode,
                                           String kindCode, String countyCode) {
        try {
            StringBuilder urlBuilder = new StringBuilder(String.format(
                    "%s?action=yearlySalesList&p_yyyy=%s&p_itemcategorycode=%s&p_itemcode=%s&p_kindcode=%s",
                    BASE_URL, yyyy, categoryCode, itemCode, kindCode
            ));

            if (countyCode != null && !countyCode.isEmpty()) {
                urlBuilder.append("&p_countycode=").append(countyCode);
            }

            urlBuilder.append(String.format("&p_convert_kg_yn=N&p_cert_key=%s&p_cert_id=%s&p_returntype=json",
                    API_KEY, API_ID));

            String url = urlBuilder.toString();

            RestTemplate restTemplate = new RestTemplate(new HttpComponentsClientHttpRequestFactory());

            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");

            ResponseEntity<String> res = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

            String body = res.getBody();

            if (body.startsWith("<!DOCTYPE")) {
                throw new RuntimeException("외부 API가 HTML 반환 (302 또는 인증 문제)");
            }

            JsonNode root = objectMapper.readTree(body);
            JsonNode priceNode = root.path("price");

            List<JsonNode> priceList = new ArrayList<>();

            // ---------------------------
            //   price 중복 방지 처리
            // ---------------------------
            if (priceNode.isArray()) {
                priceNode.forEach(priceList::add);
            } else if (priceNode.isObject()) {
                priceList.add(priceNode);
            }

            List<Object> resultList = new ArrayList<>();

            for (JsonNode product : priceList) {
                List<Object> items = new ArrayList<>();

                for (JsonNode item : product.path("item")) {
                    items.add(new YearlyItem(
                            item.path("div").asText(),
                            item.path("avg_data").asText().replace(",", ""),
                            item.path("max_data").asText().replace(",", ""),
                            item.path("min_data").asText().replace(",", "")
                    ));
                }

                resultList.add(new YearlyProduct(
                        product.path("productclscode").asText(),
                        product.path("caption").asText(),
                        items
                ));
            }

            return objectMapper.writeValueAsString(resultList);

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\":\"API 호출 실패\"}";
        }
    }



    // ----------------------------------
    //           MONTHLY API
    // ----------------------------------
    public String fetchMonthlySalesListData(String yyyy, String categoryCode, String itemCode,
                                            String kindCode, String countyCode, String period) {
        try {
            StringBuilder urlBuilder = new StringBuilder(String.format(
                    "%s?action=monthlySalesList&p_yyyy=%s&p_itemcategorycode=%s&p_itemcode=%s&p_kindcode=%s&p_period=%s",
                    BASE_URL, yyyy, categoryCode, itemCode, kindCode, period
            ));

            if (countyCode != null && !countyCode.isEmpty()) {
                urlBuilder.append("&p_countycode=").append(countyCode);
            }

            urlBuilder.append(String.format("&p_convert_kg_yn=N&p_cert_key=%s&p_cert_id=%s&p_returntype=json",
                    API_KEY, API_ID));

            String url = urlBuilder.toString();

            RestTemplate restTemplate = new RestTemplate(new HttpComponentsClientHttpRequestFactory());

            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");

            ResponseEntity<String> res = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

            String body = res.getBody();

            if (body.startsWith("<!DOCTYPE")) {
                throw new RuntimeException("외부 API가 HTML 반환 (302 또는 인증 문제)");
            }

            JsonNode root = objectMapper.readTree(body);
            JsonNode priceNode = root.path("price");

            List<JsonNode> priceList = new ArrayList<>();

            // ---------------------------
            //   price 중복 방지 처리
            // ---------------------------
            if (priceNode.isArray()) {
                priceNode.forEach(priceList::add);
            } else if (priceNode.isObject()) {
                priceList.add(priceNode);
            }

            List<Object> resultList = new ArrayList<>();

            for (JsonNode product : priceList) {
                List<Object> items = new ArrayList<>();

                for (JsonNode item : product.path("item")) {
                    items.add(new MonthlyItem(
                            item.path("yyyy").asText(),
                            item.path("m1").asText().replace(",", ""),
                            item.path("m2").asText().replace(",", ""),
                            item.path("m3").asText().replace(",", ""),
                            item.path("m4").asText().replace(",", ""),
                            item.path("m5").asText().replace(",", ""),
                            item.path("m6").asText().replace(",", ""),
                            item.path("m7").asText().replace(",", ""),
                            item.path("m8").asText().replace(",", ""),
                            item.path("m9").asText().replace(",", ""),
                            item.path("m10").asText().replace(",", ""),
                            item.path("m11").asText().replace(",", ""),
                            item.path("m12").asText().replace(",", ""),
                            item.path("yearavg").asText().replace(",", "")
                    ));
                }

                resultList.add(new MonthlyProduct(
                        product.path("productclscode").asText(),
                        product.path("caption").asText(),
                        items
                ));
            }

            return objectMapper.writeValueAsString(resultList);

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\":\"API 호출 실패\"}";
        }
    }


    // 내부 클래스들
    static class YearlyItem {
        public String year;
        public String avg;
        public String max;
        public String min;

        YearlyItem(String year, String avg, String max, String min) {
            this.year = year;
            this.avg = avg;
            this.max = max;
            this.min = min;
        }
    }

    static class YearlyProduct {
        public String productclscode;
        public String caption;
        public List<Object> items;

        YearlyProduct(String productclscode, String caption, List<Object> items) {
            this.productclscode = productclscode;
            this.caption = caption;
            this.items = items;
        }
    }

    static class MonthlyItem {
        public String year;
        public String m1;
        public String m2;
        public String m3;
        public String m4;
        public String m5;
        public String m6;
        public String m7;
        public String m8;
        public String m9;
        public String m10;
        public String m11;
        public String m12;
        public String yearAvg;

        MonthlyItem(String year, String m1, String m2, String m3, String m4, String m5, String m6,
                    String m7, String m8, String m9, String m10, String m11, String m12, String yearAvg) {
            this.year = year;
            this.m1 = m1;
            this.m2 = m2;
            this.m3 = m3;
            this.m4 = m4;
            this.m5 = m5;
            this.m6 = m6;
            this.m7 = m7;
            this.m8 = m8;
            this.m9 = m9;
            this.m10 = m10;
            this.m11 = m11;
            this.m12 = m12;
            this.yearAvg = yearAvg;
        }
    }

    static class MonthlyProduct {
        public String productclscode;
        public String caption;
        public List<Object> items;

        MonthlyProduct(String productclscode, String caption, List<Object> items) {
            this.productclscode = productclscode;
            this.caption = caption;
            this.items = items;
        }
    }
    
public List<String> getRanks(String categoryCode,
                                 String itemName,
                                 String kindName,
                                 String productClsCode) {

        return repository.findRanks(
                categoryCode,
                itemName,
                kindName,
                productClsCode
        );
    }
}
