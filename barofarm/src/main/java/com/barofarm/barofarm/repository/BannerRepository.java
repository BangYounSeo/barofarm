package com.barofarm.barofarm.repository;

import com.barofarm.barofarm.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    // MAIN 또는 MID 가져올 때 사용
    List<Banner> findByUseYnAndPositionOrderBySortOrderAsc(String useYn, String position);

    // 관리자 전체 조회
    List<Banner> findAllByUseYnOrderBySortOrderAsc(String useYn);
}
