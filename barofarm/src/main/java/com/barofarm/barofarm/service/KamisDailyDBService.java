package com.barofarm.barofarm.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.barofarm.barofarm.dto.kamis.KamisDailyDTO;
import com.barofarm.barofarm.entity.KamisDailyEntity;
import com.barofarm.barofarm.repository.KamisDailyRepository;

import lombok.RequiredArgsConstructor;
import lombok.var;

@Service
@RequiredArgsConstructor
public class KamisDailyDBService {

    private final KamisDailyRepository repository;

    // 🔒 안전한 숫자 변환 함수
    private int safeParseInt(String value) {
        try {
            if (value == null || value.trim().equals("") || value.trim().equals("-")) {
                return 0;
            }
            return (int) Double.parseDouble(value);
        } catch (Exception e) {
            return 0;
        }
    }

    //소수점나오게하기
    private double safeParseDouble(String value) {
    try {
        if (value == null || value.trim().equals("") || value.trim().equals("-")) {
            return 0.0;
        }
        return Double.parseDouble(value);
    } catch (Exception e) {
        return 0.0;
    }
}

public List<KamisDailyDTO> getDailyPriceList()  {

    // 1) productName 기준으로 중복 제거
    var distinctEntityList = repository.findAll().stream()
            .filter(e -> e.getProductName() != null)       // 🔥 null key 방지
            .collect(Collectors.toMap(
                    KamisDailyEntity::getProductName,
                    e -> e,
                    (a, b) -> a
            ))
            .values();

    return distinctEntityList.stream()
            .map(e -> {

                KamisDailyDTO dto = new KamisDailyDTO();

                dto.setId(e.getId());
                dto.setItemName(e.getItemName());
                dto.setProductName(e.getProductName());
                dto.setProductClsName(e.getProductClsName());
                dto.setProductNo(e.getProductNo());
                dto.setCategoryCode(e.getCategoryCode());
                dto.setProductClsCode(e.getProductClsCode());
                dto.setLastestDate(e.getLastestDate());
                dto.setUnit(e.getUnit());

                // 문자열 "0"으로 바꾸기
                dto.setDirection(
                    e.getDirection() == null || e.getDirection().trim().isEmpty()
                        ? "0"
                        : e.getDirection()
                );
                dto.setValue(e.getValue() == null ? 0.0 : e.getValue());

                dto.setDay1(e.getDay1());
                dto.setDpr1(e.getDpr1());
                dto.setDay2(e.getDay2());
                dto.setDpr2(e.getDpr2());
                dto.setDay3(e.getDay3());
                dto.setDpr3(e.getDpr3());
                dto.setDay4(e.getDay4());
                dto.setDpr4(e.getDpr4());

                return dto;
            })
            .collect(Collectors.toList());
}

}
