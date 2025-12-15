package com.barofarm.barofarm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.barofarm.barofarm.dto.DailyPriceDTO;
import com.barofarm.barofarm.entity.DailyPrice;

@Repository
public interface DailyPriceRepository extends JpaRepository<DailyPrice, Long> {

    DailyPrice findByItemCodeAndRankAndCategoryCodeAndKindCodeAndRegdayAndProductClsCodeAndRegionName(
        String itemCode,
        String rank,
        String categoryCode,
        String kindCode,
        String regday,
        String productClsCode,
        String regionName
);

   List<DailyPrice> findByRegdayBefore(String regday);

    List<DailyPrice> findByCategoryCodeAndProductClsCode(String categoryCode, String productClsCode);

    List<DailyPrice> findByItemCode(String itemCode);
    
    List<DailyPrice> findByCategoryCodeAndItemNameAndKindNameAndRegionNameAndProductClsCode(String categoryCode,
        String itemName,
        String kindName,
        String regionName,
         String productClsCode);

        @Query("SELECT DISTINCT d.regionName " +
       "FROM DailyPrice d " +
       "WHERE d.categoryCode = :category " +
       "AND d.itemName = :item " +
       "AND d.kindName = :kind " +
       "AND d.productClsCode = :cls " +
       "ORDER BY d.regionName")
List<String> findRegions(
        @Param("category") String category,
        @Param("item") String item,
        @Param("kind") String kind,
        @Param("cls") String cls
);

// rankCode 목록 조회
    @Query("SELECT DISTINCT d.rank " +
           "FROM DailyPrice d " +
           "WHERE d.categoryCode = :category " +
           "AND d.itemName = :item " +
           "AND d.kindName = :kind " +
           "AND d.productClsCode = :cls " +
           "ORDER BY d.rank")
    List<String> findRanks(
            @Param("category") String category,
            @Param("item") String item,
            @Param("kind") String kind,
            @Param("cls") String cls
    );

    List<DailyPrice> findByRegdayBetweenAndProductClsCode(String startDate, String endDate, String productClsCode);

    @Query("SELECT DISTINCT d.itemName FROM DailyPrice d WHERE d.kindCode = '02'")
    List<String> findDistinctItemNamesKind02();

    @Query("SELECT DISTINCT d.itemName FROM DailyPrice d WHERE d.kindCode = '01'")
    List<String> findDistinctItemNamesKind01();

    @Query("SELECT DISTINCT d.itemName FROM DailyPrice d WHERE d.kindCode = '00'")
    List<String> findDistinctItemNamesKind00();

    @Query(value = "SELECT * FROM ( " +
                   "  SELECT t.*, " +
                   "         RANK() OVER (PARTITION BY region_name ORDER BY regday DESC) AS rnk " +
                   "  FROM daily_price t " +
                   "  WHERE dpr1 != '-' " +
                   "    AND category_Code   = :categoryCode " +
                   "    AND item_Code       = :itemCode " +
                   "    AND kind_Code       = :kindCode " +
                   "    AND product_Cls_Code = :productClsCode " +
                   ") sub " +
                   "WHERE rnk = 1", nativeQuery = true)
    List<DailyPrice> findRgionByCode(@Param("categoryCode") String categoryCode,
                                      @Param("itemCode") String itemCode,
                                      @Param("kindCode") String kindCode,
                                      @Param("productClsCode") String productClsCode);

    //salesboardListCategory 상품목록에 띄울 repository 수정일: 12/3
    List<DailyPrice> findByItemCodeAndRegdayAndRegionName(
            String itemCode,
            String regday,
            String regionName
    );                             

}
