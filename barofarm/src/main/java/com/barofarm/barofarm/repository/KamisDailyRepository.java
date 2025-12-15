package com.barofarm.barofarm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.barofarm.barofarm.entity.KamisDailyEntity;

@Repository
public interface KamisDailyRepository extends JpaRepository<KamisDailyEntity, Long> {

    // ---------------------------------------------------------------------
    // ✔ 필수 메서드: KamisDailyService 에서 사용 중 (리스트 버전)
    // ---------------------------------------------------------------------
    List<KamisDailyEntity> findByProductNoAndProductClsCodeAndLastestDate(
            String productNo,
            String productClsCode,
            String lastestDate
    );

    Optional<KamisDailyEntity> findFirstByProductNoAndProductClsCodeAndLastestDate(
            String productNo,
            String productClsCode,
            String lastestDate
    );

    // ---------------------------------------------------------------------
    // ✔ itemName + clsCode 기반 productNo 조회
    // ---------------------------------------------------------------------
    Optional<KamisDailyEntity> findFirstByItemNameAndProductClsCodeOrderByLastestDateDesc(
            String itemName,
            String productClsCode
    );

    // ---------------------------------------------------------------------
    // ✔ distinct itemName 리스트
    // ---------------------------------------------------------------------
    @Query("SELECT DISTINCT k.itemName FROM KamisDailyEntity k WHERE k.productClsCode = '02'")
    List<String> findDistinctItemNamesKind02();

    @Query("SELECT DISTINCT k.itemName FROM KamisDailyEntity k WHERE k.productClsCode = '01'")
    List<String> findDistinctItemNamesKind01();

    // ---------------------------------------------------------------------
    // ✔ productNo / productName 기반 조회 (보조)
    // ---------------------------------------------------------------------
    List<KamisDailyEntity> findByProductNo(String productNo);

    List<KamisDailyEntity> findByProductName(String productName);

    // ---------------------------------------------------------------------
    // ✔ 오래된 데이터 삭제용
    // ---------------------------------------------------------------------
    List<KamisDailyEntity> findByLastestDateBefore(String lastestDate);

    //naverlap에 쓸거
    @Query("SELECT k FROM KamisDailyEntity k")
    List<KamisDailyEntity> findAllForPopular();

    //키워드별 인기검색어
    List<KamisDailyEntity> findByItemNameContaining(String keyword);

    // 🔹 PRODUCT_CLS_NAME = '소매' 인 것만 가져오기
    @Query("select k from KamisDailyEntity k where k.productClsName = '소매'")
    List<KamisDailyEntity> findAllRetailItems();

    //direction=0 && 소매(01) && 특정날짜 기준으로 value 높은 순 상위 7개
    List<KamisDailyEntity> findTop7ByProductClsCodeAndLastestDateAndDirectionOrderByValueDesc(
        String productClsCode,
        String lastestDate,
        String direction
    );
}
