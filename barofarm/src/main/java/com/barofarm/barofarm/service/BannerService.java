package com.barofarm.barofarm.service;

import java.util.List;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.barofarm.barofarm.repository.BannerRepository;
import com.barofarm.barofarm.entity.Banner;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    // 메인 배너
    public List<Banner> getMainBanners() {
        return bannerRepository.findByUseYnAndPositionOrderBySortOrderAsc("Y", "MAIN");
    }

    // 중간 배너
    public List<Banner> getMidBanners() {
        return bannerRepository.findByUseYnAndPositionOrderBySortOrderAsc("Y", "MID");
    }

    // 전체
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public Banner createBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(Long id, Banner updated) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("배너를 찾을 수 없습니다."));

        banner.setTitle(updated.getTitle());
        banner.setImageUrl(updated.getImageUrl());
        banner.setLinkUrl(updated.getLinkUrl());
        banner.setSortOrder(updated.getSortOrder());
        banner.setUseYn(updated.getUseYn());
        banner.setPosition(updated.getPosition());
        banner.setMainText(updated.getMainText());
        banner.setSubText(updated.getSubText());

        return bannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }
}

