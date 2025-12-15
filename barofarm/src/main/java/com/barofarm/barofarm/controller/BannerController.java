package com.barofarm.barofarm.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import com.barofarm.barofarm.entity.Banner;
import com.barofarm.barofarm.service.BannerService;

@RestController
@RequestMapping("/api/banner")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping("/main")
    public List<Banner> getMainBanners() {
        return bannerService.getMainBanners();
    }

    @GetMapping("/mid")
    public List<Banner> getMidBanners() {
        return bannerService.getMidBanners();
    }

    @GetMapping("/all")
    public List<Banner> getAll() {
        return bannerService.getAllBanners();
    }

    @PostMapping
    public Banner createBanner(@RequestBody Banner banner) {
        return bannerService.createBanner(banner);
    }

    @PutMapping("/{id}")
    public Banner updateBanner(@PathVariable Long id, @RequestBody Banner banner) {
        return bannerService.updateBanner(id, banner);
    }

    @DeleteMapping("/{id}")
    public void deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
    }
}

