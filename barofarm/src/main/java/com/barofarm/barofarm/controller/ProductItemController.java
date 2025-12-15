package com.barofarm.barofarm.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.barofarm.barofarm.entity.ProductItems;
import com.barofarm.barofarm.service.ProductItemService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/productItems")
public class ProductItemController {

    private final ProductItemService service;

    // 대분류(categoryCode)로 소분류 조회
    @GetMapping
    public List<ProductItems> getItems(@RequestParam int categoryCode) {
        return service.getItemsByCategory(categoryCode);
    }
    
    @GetMapping("/searchItem")
    public List<ProductItems> getSearchByCategory(@RequestParam String search) {
    	return service.getSearchByCategory(search);
    }
}
