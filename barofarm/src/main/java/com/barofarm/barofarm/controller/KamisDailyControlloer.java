//controller
package com.barofarm.barofarm.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.barofarm.barofarm.dto.kamis.KamisDailyDTO;
import com.barofarm.barofarm.entity.KamisDailyEntity;
import com.barofarm.barofarm.repository.KamisDailyRepository;
import com.barofarm.barofarm.service.KamisDailyDBService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api/daily/sales/list")
@RequiredArgsConstructor
public class KamisDailyControlloer {
    
    private final KamisDailyRepository repository;
    private final KamisDailyDBService dbService;

    // 모든 카테고리 데이터 조회
    @GetMapping
    public List<KamisDailyEntity> getAllDailyPrice(){
        return repository.findAll();
    }

    @GetMapping("/dto")
    public List<KamisDailyDTO> getDailyPriceDTO() {
        return dbService.getDailyPriceList();
    }

    @GetMapping("/cheap-items")
    public ResponseEntity<?> grtCheapItems(
        @RequestParam(required = false)
        @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate regday,
        @RequestParam(defaultValue = "01") String clsCode
    ) {
        //기준일 없으면 어제로
        LocalDate baseDate = (regday != null) ? regday : LocalDate.now().minusDays(1);

        List<KamisDailyEntity> entities = repository.findTop7ByProductClsCodeAndLastestDateAndDirectionOrderByValueDesc(clsCode, baseDate.toString(),"0");

        //DTO로 변환(one/kind01이랑 같은 패턴)
        List<KamisDailyDTO> dtoList = new java.util.ArrayList<KamisDailyDTO>();

            for (KamisDailyEntity entity : entities) {
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

                dtoList.add(dto);
            }

            return ResponseEntity.ok(dtoList);
        }
}