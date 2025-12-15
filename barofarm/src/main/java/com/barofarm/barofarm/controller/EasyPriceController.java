package com.barofarm.barofarm.controller;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.barofarm.barofarm.dto.DailyPriceDTO;
import com.barofarm.barofarm.dto.kamis.KamisDailyDTO;
import com.barofarm.barofarm.entity.DailyPrice;
import com.barofarm.barofarm.entity.KamisDailyEntity;
import com.barofarm.barofarm.repository.KamisDailyRepository;
import com.barofarm.barofarm.service.EasyPriceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/easy-price")
public class EasyPriceController {

    private final EasyPriceService easyPriceService;
    private final KamisDailyRepository repository;

    @GetMapping("/daily")
    public ResponseEntity<?> getDaily(
            @RequestParam String productName,
            @RequestParam String regday,
            @RequestParam String clsCode
    ) throws Exception {

        LocalDate date = LocalDate.parse(regday);
        Map<String, Object> data = easyPriceService.getDailyPrice(productName, date,clsCode);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyPrice(
            @RequestParam String productName,
            @RequestParam String regday,
            @RequestParam String clsCode
    ) throws Exception {

        Map<String, Object> data = easyPriceService.getMonthlyPrice(productName, regday, clsCode);

        return ResponseEntity.ok(data);
    } 

        @GetMapping("/yearly")
        public ResponseEntity<?> getYearly(
                @RequestParam String productName,                
                @RequestParam String regday,
                @RequestParam String clsCode
        ) throws Exception {

            return ResponseEntity.ok(
                easyPriceService.getYearlyPrice(productName, regday, clsCode)
            );
        }

    @GetMapping("/items/distinct/kind02")
    public List<String> getDistinctItems2() {
        return repository.findDistinctItemNamesKind02();
    }

    @GetMapping("/items/distinct/kind01")
    public List<String> getDistinctItems1() {
        return repository.findDistinctItemNamesKind01();
    }

@GetMapping("/one/kind02")
public ResponseEntity<?> getOneKind02(
        @RequestParam String itemName,
        @RequestParam String regday
) {
    // 1) itemName + 도매(02) 로 정확한 productNo 찾기
    KamisDailyEntity base = repository
        .findFirstByItemNameAndProductClsCodeOrderByLastestDateDesc(itemName, "02")
        .orElseThrow(() -> new IllegalArgumentException("도매 상품 없음: " + itemName));

    String productNo = base.getProductNo();

    // 2) 날짜별 정확한 row 가져오기
    KamisDailyEntity entity = repository
        .findFirstByProductNoAndProductClsCodeAndLastestDate(
            productNo, "02", regday
        )
        .orElse(base); // fallback

    // 3) DTO 생성
    KamisDailyDTO dto = new KamisDailyDTO(
        entity.getId(),
        entity.getItemName(),
        entity.getProductName(),
        entity.getProductNo(),
        entity.getCategoryCode(),
        entity.getProductClsCode(),
        entity.getProductClsName(),
        entity.getLastestDate(),
        entity.getDirection(),
        entity.getUnit(),
        entity.getValue(),

        entity.getDay1(), entity.getDpr1(),
        entity.getDay2(), entity.getDpr2(),
        entity.getDay3(), entity.getDpr3(),
        entity.getDay4(), entity.getDpr4()
    );

    return ResponseEntity.ok(dto);
}


@GetMapping("/one/kind01")
public ResponseEntity<?> getOneKind01(
        @RequestParam String itemName,
        @RequestParam String regday
) {
    // 1) itemName + 소매(01) 로 정확한 productNo 찾기
    KamisDailyEntity base = repository
        .findFirstByItemNameAndProductClsCodeOrderByLastestDateDesc(itemName, "01")
        .orElseThrow(() -> new IllegalArgumentException("도매 상품 없음: " + itemName));

    String productNo = base.getProductNo();

    // 2) 날짜별 정확한 row 가져오기
    KamisDailyEntity entity = repository
        .findFirstByProductNoAndProductClsCodeAndLastestDate(
            productNo, "01", regday
        )
        .orElse(base); // fallback

    // 3) DTO 생성
    KamisDailyDTO dto = new KamisDailyDTO(
        entity.getId(),
        entity.getItemName(),
        entity.getProductName(),
        entity.getProductNo(),
        entity.getCategoryCode(),
        entity.getProductClsCode(),
        entity.getProductClsName(),
        entity.getLastestDate(),
        entity.getDirection(),
        entity.getUnit(),
        entity.getValue(),

        entity.getDay1(), entity.getDpr1(),
        entity.getDay2(), entity.getDpr2(),
        entity.getDay3(), entity.getDpr3(),
        entity.getDay4(), entity.getDpr4()
    );

    return ResponseEntity.ok(dto);
}


}
