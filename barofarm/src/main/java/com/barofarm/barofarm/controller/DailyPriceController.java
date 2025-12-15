package com.barofarm.barofarm.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.barofarm.barofarm.dto.DailyPriceDTO;
import com.barofarm.barofarm.entity.DailyPrice;
import com.barofarm.barofarm.repository.DailyPriceRepository;
import com.barofarm.barofarm.service.DailyPriceService;
import com.barofarm.barofarm.service.SearchDetailService;
import com.solapi.shadow.okhttp3.MediaType;
import com.solapi.shadow.okhttp3.internal.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/detail")
@RequiredArgsConstructor
public class DailyPriceController {
    
    private final DailyPriceRepository repository;
    private final SearchDetailService searchDetailService;
    private final DailyPriceService dailyPriceService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String pythonServerUrl = "http://192.168.0.18:5000/predict";

    // 모든 카테고리 데이터 조회
    @GetMapping("/dailyPrice")
    public List<DailyPrice> getAll(){
        return repository.findAll();
    }
@GetMapping("/categories")
public List<String> getCategories() {
    return repository.findAll()
                     .stream()
                     .map(DailyPrice::getCategoryCode)
                     .distinct()
                     .sorted()
                     .collect(Collectors.toList());
}
    @GetMapping("/items")
public List<String> getItemsByCategory(@RequestParam String categoryCode, @RequestParam String productClsCode) {
    List<DailyPrice> list = repository.findByCategoryCodeAndProductClsCode(categoryCode,productClsCode);
    // 중복 제거하고 item_name만 반환
    return list.stream()
            .map(DailyPrice::getItemName)
            .distinct()
            .sorted()
            .collect(Collectors.toList());
}

// 특정 item_name에 따른 kind_name 조회
@GetMapping("/kinds")
public List<String> getKindsByItem(
        @RequestParam String categoryCode,
        @RequestParam String itemName,
        @RequestParam String productClsCode
) {
    List<DailyPrice> list = repository.findByCategoryCodeAndProductClsCode(categoryCode,productClsCode);
    return list.stream()
            .filter(d -> d.getItemName().equals(itemName))
            .map(DailyPrice::getKindName)
            .distinct()
            .sorted()
            .collect(Collectors.toList());
}

@GetMapping("/ranks")
public List<String> getRanks(
    @RequestParam String categoryCode,
    @RequestParam String itemName,
    @RequestParam String kindName,
    @RequestParam String productClsCode
){
    return searchDetailService.getRanks(categoryCode, itemName, kindName, productClsCode);
}

 @GetMapping("/regions")
    public List<String> getRegions(
            @RequestParam String categoryCode,
            @RequestParam String itemName,
            @RequestParam String kindName,
            @RequestParam String productClsCode
    ) {
        return repository.findRegions(
                categoryCode,
                itemName,
                kindName,
                productClsCode
        );
    }

@GetMapping("/search")
public List<DailyPrice> getSearchData(DailyPriceDTO req) {

    return searchDetailService.getDetailSearch(
            req.getCategoryCode(),
            req.getItemName(),
            req.getKindName(),
            req.getRegionName(),
            req.getProductClsCode()
    );
}

@GetMapping("/yearlySalesList")
public ResponseEntity<String> getYearlySalesList(
        @RequestParam String p_yyyy,
        @RequestParam String p_itemcategorycode,
        @RequestParam String p_itemcode,
        @RequestParam String p_kindcode,
        @RequestParam(required = false, defaultValue = "") String p_countycode
) {
    String result = searchDetailService.fetchYearlySalesListData(
        p_yyyy, p_itemcategorycode, p_itemcode, p_kindcode, p_countycode
    );
    return ResponseEntity.ok(result);
}

 @GetMapping("/region")
    public List<DailyPriceDTO> getLatestRegionData(
            @RequestParam String categoryCode,
            @RequestParam String itemCode,
            @RequestParam String kindCode,
            @RequestParam String productClsCode
    ) {
        return searchDetailService.getLatestRegionData(categoryCode, itemCode, kindCode, productClsCode);
    }


@GetMapping("/monthlySalesList")
public ResponseEntity<String> getMonthlySalesList(
        @RequestParam String p_yyyy,
        @RequestParam String p_itemcategorycode,
        @RequestParam String p_itemcode,
        @RequestParam String p_kindcode,
        @RequestParam String p_period,
        @RequestParam(required = false, defaultValue = "") String p_countycode
) {
    String result = searchDetailService.fetchMonthlySalesListData(
        p_yyyy, p_itemcategorycode, p_itemcode, p_kindcode, p_countycode,p_period
    );
    return ResponseEntity.ok(result);


}

@PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predictPrice(@RequestBody Map<String, Object> input) {
        // input 예시: { "model":"RandomForest", "features":{ "categoryCode":0, "itemCode":1, ... } }

        Map<String, Object> response = restTemplate.postForObject(pythonServerUrl, input, Map.class);
        return ResponseEntity.ok(response);
    }

    //salesboardListCategory 상품목록에 띄울 repository 수정일: 12/3
    @GetMapping("/daily-price/yesterday")
    public ResponseEntity<?> getYesterdayPrices(@RequestParam String itemCode) {
        return ResponseEntity.ok(dailyPriceService.getYesterdayPrices(itemCode));
    }
    
}



