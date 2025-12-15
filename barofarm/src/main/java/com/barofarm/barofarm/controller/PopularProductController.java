package com.barofarm.barofarm.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.barofarm.barofarm.entity.KamisDailyEntity;
import com.barofarm.barofarm.service.PopularProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/data")
public class PopularProductController {

    private final PopularProductService service;

    @GetMapping("/popular-products")
    public List<KamisDailyEntity> getPopular() throws Exception {
        return service.getTop7();
    }
}
