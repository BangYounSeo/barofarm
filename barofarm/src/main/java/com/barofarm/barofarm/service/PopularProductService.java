package com.barofarm.barofarm.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.barofarm.barofarm.entity.KamisDailyEntity;
import com.barofarm.barofarm.repository.KamisDailyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PopularProductService {

    private final KamisDailyRepository repository;
    private final NaverTrendScrapingService trendService;

    // 🔹 자바 8용 isBlank 유틸
    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String baseName(String rawName) {
        if (rawName == null) return null;
        String s = rawName.trim();
        int idx = s.indexOf("/");
        if (idx > 0) {
            s = s.substring(0, idx);
        }
        return s.trim();
    }

    /**
     * DB의 소매 상품에서 후보 키워드 목록 뽑기
     * - PRODUCT_CLS_NAME = '소매'
     * - itemName 또는 productName 사용
     * - "/" 앞부분만 사용
     * - 중복 제거 (같은 "배추"가 여러 줄 있어도 1번만)
     */
    private List<String> buildCandidatesFromDb() {
        List<KamisDailyEntity> retailList = repository.findAllRetailItems();

        // 순서를 유지하면서 중복 제거하려고 LinkedHashSet 느낌으로 사용
        Map<String, Boolean> seen = new LinkedHashMap<String, Boolean>();
        List<String> result = new ArrayList<String>();

        for (KamisDailyEntity e : retailList) {
            String name = e.getItemName();
            if (isBlank(name)) {
                name = e.getProductName();
            }
            if (isBlank(name)) {
                continue;
            }

            String keyword = baseName(name); // 예: "배추/가을" -> "배추"
            if (isBlank(keyword)) {
                continue;
            }

            if (!seen.containsKey(keyword)) {
                seen.put(keyword, Boolean.TRUE);
                result.add(keyword);
            }
        }
        System.out.println("📌 후보 키워드 개수 = " + result.size() + ", 목록 = " + result);
        return result;
    }

public List<KamisDailyEntity> getTop7() throws Exception {

    // 🔹 1) DB에서 후보 키워드 만들기
    List<String> candidates = buildCandidatesFromDb();

    // 🔹 2) 네이버 트렌드 API에 후보들 던져서 TOP7 키워드 얻기
    //     (여기서 5개씩 끊어서 여러 번 호출하는 건
    //      이미 NaverTrendScrapingService 내부에서 처리함)
    List<String> keywords = trendService.getTop7Keywords("50000160", candidates);
    System.out.println("⭐ 네이버 TOP 키워드(최대 7개) = " + keywords);

    List<KamisDailyEntity> result = new ArrayList<KamisDailyEntity>();
    if (keywords == null || keywords.isEmpty()) {
        return result;
    }

    // 🔹 3) DB 소매 상품 전체 한 번만 읽어오기
    List<KamisDailyEntity> all = repository.findAllRetailItems();

    List<KamisDailyEntity> matched = new ArrayList<KamisDailyEntity>();
    Set<Long> usedIds = new HashSet<Long>();

    for (String kw : keywords) {
        if (isBlank(kw)) {
            continue;
        }

        String normKw = kw.replace(" ", "");
        boolean found = false;

        for (KamisDailyEntity e : all) {

            String rawName = e.getItemName();
            if (isBlank(rawName)) {
                rawName = e.getProductName();
            }
            if (isBlank(rawName)) {
                continue;
            }

            String cleaned = baseName(rawName); // "/" 앞부분 사용
            if (isBlank(cleaned)) {
                continue;
            }

            String normName = cleaned.replace(" ", "");

            // 🔹 "쌀" vs "쌀20kg" 처럼 앞뒤가 비슷한 것끼리 매칭
            if (normKw.startsWith(normName) || normName.startsWith(normKw)) {

                Long id = e.getId();
                if (id != null && !usedIds.contains(id)) {
                    matched.add(e);
                    usedIds.add(id);
                    System.out.println("✅ 매칭 성공: kw=" + kw + ", item=" + rawName);
                }
                found = true;
                break;
            }
        }

        if (!found) {
            System.out.println("⛔ 매칭 실패: kw=" + kw);
        }

        if (matched.size() >= 7) {
            break;
        }
    }

    System.out.println("🎯 최종 매칭 개수 = " + matched.size());
    result.addAll(matched);
    return result;
}

}
