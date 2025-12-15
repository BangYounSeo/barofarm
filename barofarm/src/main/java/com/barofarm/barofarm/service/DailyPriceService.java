package com.barofarm.barofarm.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.barofarm.barofarm.entity.DailyPrice;
import com.barofarm.barofarm.repository.DailyPriceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DailyPriceService {

    private final DailyPriceRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${kamis.api.api-key}")
    private String API_KEY;
    
    @Value("${kamis.api.api-id}")
    private String API_ID;

    // 🔥 소매/도매
    private static final String[] PRODUCT_CLS_CODES = {"01", "02"}; // 01: 소매, 02: 도매
    private static final String[] CATEGORY_CODES = {"100", "200", "300", "400"};

    // 소매 지역코드
    private static final String[] RETAIL_COUNTRY_CODES = {
            "1101","2100","2200","2300","2401","2501","2601","3111","3214","3211",
            "3311","3511","3711","3911","3113","3613","3714","3814","3145","2701",
            "3112","3138","3411","3818",""
    };

    // 도매 지역코드
    private static final String[] WHOLESALE_COUNTRY_CODES = {
            "1101","2100","2200","2401","2501",""
    };

    // 지역명 매핑 (Java 8용)
    private static final Map<String, String> REGION_NAME_MAP;
    static {
        REGION_NAME_MAP = new HashMap<>();
        REGION_NAME_MAP.put("1101", "서울");
        REGION_NAME_MAP.put("2100", "부산");
        REGION_NAME_MAP.put("2200", "대구");
        REGION_NAME_MAP.put("2300", "인천");
        REGION_NAME_MAP.put("2401", "광주");
        REGION_NAME_MAP.put("2501", "대전");
        REGION_NAME_MAP.put("2601", "울산");
        REGION_NAME_MAP.put("3111", "수원");
        REGION_NAME_MAP.put("3214", "강릉");
        REGION_NAME_MAP.put("3211", "춘천");
        REGION_NAME_MAP.put("3311", "청주");
        REGION_NAME_MAP.put("3511", "전주");
        REGION_NAME_MAP.put("3711", "포항");
        REGION_NAME_MAP.put("3911", "제주");
        REGION_NAME_MAP.put("3113", "의정부");
        REGION_NAME_MAP.put("3613", "순천");
        REGION_NAME_MAP.put("3714", "안동");
        REGION_NAME_MAP.put("3814", "창원");
        REGION_NAME_MAP.put("3145", "용인");
        REGION_NAME_MAP.put("2701", "세종");
        REGION_NAME_MAP.put("3112", "성남");
        REGION_NAME_MAP.put("3138", "고양");
        REGION_NAME_MAP.put("3411", "천안");
        REGION_NAME_MAP.put("3818", "김해");
        REGION_NAME_MAP.put("", "전체");
    }

    private static final String BASE_URL =
            "http://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList"
            + "&p_product_cls_code=%s"
            + "&p_regday=%s"
            + "&p_convert_kg_yn=N"
            + "&p_item_category_code=%s"
            + "&p_country_code=%s"   // 🔥 지역 추가
            + "&p_cert_key=%s"
            + "&p_cert_id=%s"
            + "&p_returntype=json";

    // @PostConstruct
    // public void init() {
    //     updateDailyPrice();
    // }

    @Scheduled(cron = "0 0 6 * * ?") // 매일 06:00 실행
    public void updateDailyPrice() {
        LocalDate today = LocalDate.now();
        LocalDate deleteBeforeDate = today.minusDays(10); // 10일 이전 삭제 기준일

        for (String productCls : PRODUCT_CLS_CODES) {

            String[] countryCodes = productCls.equals("01") ? RETAIL_COUNTRY_CODES : WHOLESALE_COUNTRY_CODES;

            for (String category : CATEGORY_CODES) {
                for (String countryCode : countryCodes) {
                    for (int i = 0; i < 10; i++) {
                        LocalDate targetDate = today.minusDays(i);
                        String regDate = targetDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

                        try {
                            List<DailyPrice> apiData = fetchData(productCls, category, countryCode, regDate);

                            for (DailyPrice dp : apiData) {
                                dp.setProductClsCode(productCls);
                                dp.setRegionCode(countryCode);
                                dp.setRegionName(REGION_NAME_MAP.getOrDefault(countryCode, "전체"));

                               DailyPrice existing = repository.findByItemCodeAndRankAndCategoryCodeAndKindCodeAndRegdayAndProductClsCodeAndRegionName(
                                    dp.getItemCode(),
                                    dp.getRank(),
                                    dp.getCategoryCode(),
                                    dp.getKindCode(),
                                    dp.getRegday(),
                                    dp.getProductClsCode(),
                                    dp.getRegionName()
                            );

                            // 기존 데이터 있으면 업데이트 로직 추가 🔥
                            if (existing != null) {
                            boolean isUpdated = false;

                            // dpr1 ~ dpr7 비교 후 다르면 업데이트
                            if (!equals(existing.getDpr1(), dp.getDpr1())) { existing.setDpr1(dp.getDpr1()); existing.setDay1(dp.getDay1()); isUpdated = true; }
                            if (!equals(existing.getDpr2(), dp.getDpr2())) { existing.setDpr2(dp.getDpr2()); existing.setDay2(dp.getDay2()); isUpdated = true; }
                            if (!equals(existing.getDpr3(), dp.getDpr3())) { existing.setDpr3(dp.getDpr3()); existing.setDay3(dp.getDay3()); isUpdated = true; }
                            if (!equals(existing.getDpr4(), dp.getDpr4())) { existing.setDpr4(dp.getDpr4()); existing.setDay4(dp.getDay4()); isUpdated = true; }
                            if (!equals(existing.getDpr5(), dp.getDpr5())) { existing.setDpr5(dp.getDpr5()); existing.setDay5(dp.getDay5()); isUpdated = true; }
                            if (!equals(existing.getDpr6(), dp.getDpr6())) { existing.setDpr6(dp.getDpr6()); existing.setDay6(dp.getDay6()); isUpdated = true; }
                            if (!equals(existing.getDpr7(), dp.getDpr7())) { existing.setDpr7(dp.getDpr7()); existing.setDay7(dp.getDay7()); isUpdated = true; }

                            if (isUpdated) {
                                repository.save(existing);
                            }

                            continue; // 다음 데이터로
                             }

                            // 기존 데이터 없으면 새로 저장
                            repository.save(dp);

                            }


                        } catch (Exception e) {
                            System.err.println("API 오류: " + e.getMessage());
                        }
                    }
                }
            }

            // 🔥 10일 이전 데이터 삭제 
            List<DailyPrice> oldData = repository.findByRegdayBefore(deleteBeforeDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            repository.deleteAll(oldData);
        }
    }

    private List<DailyPrice> fetchData(String productClsCode, String categoryCode, String countryCode, String regDate) throws Exception {
        String url = String.format(BASE_URL, productClsCode, regDate, categoryCode, countryCode, API_KEY, API_ID);
        System.out.println("URL 호출: " + url);

        RestTemplate restTemplate = new RestTemplate(new HttpComponentsClientHttpRequestFactory());
        HttpHeaders headers = new HttpHeaders();
        headers.add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36");

        ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
        JsonNode root = objectMapper.readTree(res.getBody());
        JsonNode data = root.path("data");

        if (!"000".equals(data.path("error_code").asText())) {
            return new ArrayList<>();
        }

        JsonNode items = data.path("item");
        if (!items.isArray()) return new ArrayList<>();

        List<DailyPrice> list = new ArrayList<>();
        for (JsonNode item : items) {
            DailyPrice dp = new DailyPrice();
            dp.setItemName(item.path("item_name").asText());
            dp.setItemCode(item.path("item_code").asText());
            dp.setKindName(item.path("kind_name").asText());
            dp.setKindCode(item.path("kind_code").asText());
            dp.setRank(item.path("rank").asText());
            dp.setRankCode(item.path("rank_code").asText());
            dp.setUnit(item.path("unit").asText());
            dp.setDay1(item.path("day1").asText());
            dp.setDpr1(item.path("dpr1").asText().replace(",", ""));
            dp.setDay2(item.path("day2").asText());
            dp.setDpr2(item.path("dpr2").asText().replace(",", ""));
            dp.setDay3(item.path("day3").asText());
            dp.setDpr3(item.path("dpr3").asText().replace(",", ""));
            dp.setDay4(item.path("day4").asText());
            dp.setDpr4(item.path("dpr4").asText().replace(",", ""));
            dp.setDay5(item.path("day5").asText());
            dp.setDpr5(item.path("dpr5").asText().replace(",", ""));
            dp.setDay6(item.path("day6").asText());
            dp.setDpr6(item.path("dpr6").asText().replace(",", ""));
            dp.setDay7(item.path("day7").asText());
            dp.setDpr7(item.path("dpr7").asText().replace(",", ""));

            dp.setCategoryCode(categoryCode);
            dp.setRegday(regDate);
            dp.setProductClsCode(productClsCode);
            dp.setRegionCode(countryCode);
            dp.setRegionName(REGION_NAME_MAP.getOrDefault(countryCode, "전체"));

            list.add(dp);
        }
        return list;
    }
    private boolean equals(String a, String b) {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return a.equals(b);
}


    public List<DailyPrice> getPrices(String itemCode) {
        return repository.findByItemCode(itemCode);
    }


    
    //salesboardListCategory 상품목록에 띄울 service 수정일: 12/3
    public Map<String, Map<String, List<DailyPrice>>> getYesterdayPrices(String itemCode) {

        LocalDate yesterday = LocalDate.now().minusDays(1);
        DayOfWeek day = yesterday.getDayOfWeek();

        // 일요일이면 하루 더 뒤로 가기
        if (day == DayOfWeek.SUNDAY) {
            yesterday = yesterday.minusDays(1);
        }

        String regday = yesterday.toString();

        List<DailyPrice> list = repository.findByItemCodeAndRegdayAndRegionName(
                itemCode,
                regday,
                "전체"
        );

        Map<String, Map<String,List<DailyPrice>>> result = new HashMap<>();

        //01=소메,02=도매
        Map<String, List<DailyPrice>> retailGroup = new HashMap<>();
        Map<String, List<DailyPrice>> wholesaleGroup = new HashMap<>();
        
        for (DailyPrice dp : list) {
            String kind = normalizeKind(dp.getKindName());
            String cls = dp.getProductClsCode();

            if ("01".equals(cls)) {
                if(!retailGroup.containsKey(kind)){
                    retailGroup.put(kind, new ArrayList<DailyPrice>());
                }
                retailGroup.get(kind).add(dp);
            }else if ("02".equals(cls)) {
                if(!wholesaleGroup.containsKey(kind)) {
                    wholesaleGroup.put(kind, new ArrayList<DailyPrice>());
                }
                wholesaleGroup.get(kind).add(dp);
            }
        }

        result.put("retail",retailGroup);
        result.put("wholesale",wholesaleGroup);
        

        return result;
    }    
    private String normalizeKind(String kindName) {
        if (kindName == null) return "";
        int idx = kindName.indexOf("(");
        if (idx > 0) return kindName.substring(0, idx).trim(); 
        return kindName.trim();
    }

}
