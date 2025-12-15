package com.barofarm.barofarm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.barofarm.barofarm.entity.PlatformAmountTransaction;

@Repository
public interface PlatformAmountTransactionRepository extends JpaRepository<PlatformAmountTransaction, Long> {

    /**
     * 월별 수익 합계
     * - PLATFORM_AMOUNT_TRANSACTION.CREATED_AT 기준
     * - TYPE = 'PAID' 만 집계
     * 반환: [0] = YM(String, 'YYYY-MM'), [1] = AMOUNT(Number)
     */
    @Query(
        value = "SELECT TO_CHAR(t.CREATED_AT, 'YYYY-MM') AS YM, " +
                "       SUM(t.AMOUNT) AS AMOUNT " +
                "FROM PLATFORM_AMOUNT_TRANSACTION t " +
                "WHERE t.TYPE = 'PAID' " +
                "GROUP BY TO_CHAR(t.CREATED_AT, 'YYYY-MM') " +
                "ORDER BY YM",
        nativeQuery = true
    )
    List<Object[]> findMonthlyRevenue();


    /**
     * 컴플레인(취소/환불) 많은 상품 TOP5
     * - PLATFORM_AMOUNT_TRANSACTION.TYPE IN ('CANCEL', 'REFUNDED')
     * - PURCHASE_DETAIL, SALES_BOARD JOIN
     * 반환: [0]=NUM_BRD(Long), [1]=SUBJECT(String), [2]=USER_ID(String),
     *       [3]=PRICE(Number), [4]=CANCEL_CNT(Number)
     */
    @Query(
        value =
            "SELECT * FROM ( " +
            "   SELECT sb.NUM_BRD AS NUM_BRD, " +
            "          sb.SUBJECT AS SUBJECT, " +
            "          sb.USER_ID AS USER_ID, " +
            "          sb.PRICE AS PRICE, " +
            "          COUNT(*) AS CANCEL_CNT " +
            "   FROM PLATFORM_AMOUNT_TRANSACTION pat " +
            "   JOIN PURCHASE_DETAIL pd ON pat.NUM_PURD = pd.NUM_PURD " +
            "   JOIN SALES_BOARD sb ON pd.NUM_BRD = sb.NUM_BRD " +
            "   WHERE pat.TYPE IN ('CANCEL', 'REFUNDED') " +
            "   GROUP BY sb.NUM_BRD, sb.SUBJECT, sb.USER_ID, sb.PRICE " +
            "   ORDER BY COUNT(*) DESC " +
            ") t " +
            "WHERE ROWNUM <= 5",
        nativeQuery = true
    )
    List<Object[]> findComplaintTop5();
}
