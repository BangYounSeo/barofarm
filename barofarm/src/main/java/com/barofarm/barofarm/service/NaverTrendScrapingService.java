package com.barofarm.barofarm.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class NaverTrendScrapingService {

    private static final String API_URL =
            "https://openapi.naver.com/v1/datalab/shopping/category/keywords";

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.client-secret}")
    private String clientSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 🔹 자바 8용 isBlank 유틸
    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    // 🔹 키워드 + 점수(최근7일 ratio 합계)
    public static class KeywordStat {
        private final String keyword;
        private final double score;

        public KeywordStat(String keyword, double score) {
            this.keyword = keyword;
            this.score = score;
        }

        public String getKeyword() {
            return keyword;
        }

        public double getScore() {
            return score;
        }
    }

    /**
     * 지정된 카테고리 + 키워드 리스트에 대해
     * 최근 7일간 ratio 합계를 계산해서 내림차순 정렬.
     *
     * 👉 네이버 제약: keyword는 한 요청당 최대 5개
     *    → 5개씩 잘라서 여러 번 호출한 뒤, 결과를 합쳐서 정렬
     */
    public List<KeywordStat> getKeywordStats(String categoryId, List<String> keywords) throws Exception {
        if (keywords == null || keywords.isEmpty()) {
            return Collections.emptyList();
        }

        // 최근 7일
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);

        final int MAX_PER_REQUEST = 5;

        // 키워드별 점수 누적용
        Map<String, Double> scoreMap = new HashMap<String, Double>();

        // 5개씩 끊어서 호출
        int size = keywords.size();
        for (int i = 0; i < size; i += MAX_PER_REQUEST) {
            int toIndex = Math.min(i + MAX_PER_REQUEST, size);
            List<String> subList = keywords.subList(i, toIndex);

            JsonNode body = buildRequestBody(categoryId, subList, start, end);
            String response = callApi(body.toString());
            List<KeywordStat> chunkStats = parseResponse(response);

            for (KeywordStat ks : chunkStats) {
                String kw = ks.getKeyword();
                double score = ks.getScore();

                Double prev = scoreMap.get(kw);
                if (prev == null) prev = 0.0;
                scoreMap.put(kw, prev + score);
            }
        }

        // Map -> List 로 변환 후 점수 기준 정렬
        List<KeywordStat> result = new ArrayList<KeywordStat>();
        for (Map.Entry<String, Double> entry : scoreMap.entrySet()) {
            result.add(new KeywordStat(entry.getKey(), entry.getValue()));
        }

        Collections.sort(result, new Comparator<KeywordStat>() {
            @Override
            public int compare(KeywordStat o1, KeywordStat o2) {
                return Double.compare(o2.getScore(), o1.getScore());
            }
        });

        return result;
    }

    public List<String> getPopularKeywordsLast7Days(String categoryId, List<String> keywords) throws Exception {
        List<KeywordStat> stats = getKeywordStats(categoryId, keywords);
        List<String> result = new ArrayList<String>();
        for (KeywordStat s : stats) {
            result.add(s.getKeyword());
        }
        return result;
    }

    public List<String> getTop7Keywords(String categoryId, List<String> keywords) throws Exception {
        List<KeywordStat> stats = getKeywordStats(categoryId, keywords);
        List<String> result = new ArrayList<String>();

        for (int i = 0; i < stats.size() && i < 7; i++) {
            result.add(stats.get(i).getKeyword());
        }
        return result;
    }

    // 네가 준 농산물 후보들
    public List<String> getTop7Keywords(String categoryId) throws Exception {
        List<String> candidates = Arrays.asList(
                "사과",
                "귤",
                "쌀20kg",
                "고구마",
                "쌀10kg",
                "딸기",
                "생강",
                "대봉감",
                "단감",
                "배추",
                "토마토",
                "찹쌀"
        );
        return getTop7Keywords(categoryId, candidates);
    }

    // ================== 내부 util ==================

    private JsonNode buildRequestBody(String categoryId,
                                      List<String> keywords,
                                      LocalDate start,
                                      LocalDate end) {

        ObjectNode root = objectMapper.createObjectNode();
        root.put("startDate", start.format(DATE_FMT));
        root.put("endDate", end.format(DATE_FMT));
        root.put("timeUnit", "date");
        root.put("category", categoryId);

        ArrayNode keywordArray = objectMapper.createArrayNode();
        for (String kw : keywords) {
            if (isBlank(kw)) {
                continue;
            }

            ObjectNode obj = objectMapper.createObjectNode();
            obj.put("name", kw);

            ArrayNode params = objectMapper.createArrayNode();
            params.add(kw);
            obj.set("param", params);

            keywordArray.add(obj);
        }
        root.set("keyword", keywordArray);

        root.put("device", "");
        root.put("gender", "");
        root.set("ages", objectMapper.createArrayNode());

        return root;
    }

    private String callApi(String body) throws Exception {
        URL url = new URL(API_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("POST");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);
        conn.setDoOutput(true);

        conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");
        conn.setRequestProperty("X-Naver-Client-Id", clientId);
        conn.setRequestProperty("X-Naver-Client-Secret", clientSecret);

        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = body.getBytes(StandardCharsets.UTF_8);
            os.write(input);
        }

        int status = conn.getResponseCode();
        InputStream is = (status >= 200 && status < 300)
                ? conn.getInputStream()
                : conn.getErrorStream();

        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(is, StandardCharsets.UTF_8))) {

            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
        }

        if (status < 200 || status >= 300) {
            throw new IllegalStateException(
                    "Naver DataLab API 오류 status=" + status + ", body=" + sb);
        }

        return sb.toString();
    }

    private List<KeywordStat> parseResponse(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode results = root.path("results");

        List<KeywordStat> stats = new ArrayList<KeywordStat>();
        if (!results.isArray()) {
            return stats;
        }

        for (JsonNode r : results) {
            String keyword = r.path("title").asText();

            if (isBlank(keyword)) {
                JsonNode kwArr = r.path("keyword");
                if (kwArr.isArray() && kwArr.size() > 0) {
                    keyword = kwArr.get(0).asText();
                }
            }

            double sum = 0.0;
            JsonNode dataArr = r.path("data");
            if (dataArr.isArray()) {
                for (JsonNode d : dataArr) {
                    sum += d.path("ratio").asDouble(0.0);
                }
            }

            stats.add(new KeywordStat(keyword, sum));
        }

        // 이 chunk 안에서 점수 기준 내림차순 정렬 (전체 정렬은 getKeywordStats에서 다시 함)
        Collections.sort(stats, new Comparator<KeywordStat>() {
            @Override
            public int compare(KeywordStat o1, KeywordStat o2) {
                return Double.compare(o2.getScore(), o1.getScore());
            }
        });

        return stats;
    }
}
