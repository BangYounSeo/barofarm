package com.barofarm.barofarm.dto.salesBoard;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import com.barofarm.barofarm.entity.SalesOptionDetail;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionDetailDTO {

    // 저장 + 리턴 공통 필드
    private String optionName; // 저장 시 사용할 필드명
    private String name; // 옵션값
    private Integer price;
    private Integer stock;
    private Integer enabled; // 판매 여부 (1/0)

    // 조회용 필드
    private int numOptD;   // 옵션 상세 ID (PK)
    private int numOptG;   // 소속 옵션그룹 ID

    /** Entity → DTO 변환 (조회용) */
    public static OptionDetailDTO from(SalesOptionDetail entity) {
        return OptionDetailDTO.builder()
                .numOptD(entity.getNumOptD())
                .optionName(entity.getSalesOptionGroup().getName()) // 그룹명 (중량, 구성)
                .name(entity.getName())   // 옵션 값 (3kg, 5kg)
                .price(entity.getPrice())
                .stock(entity.getStock())
                .enabled(entity.getEnabled())
                .numOptG(entity.getSalesOptionGroup().getNumOptG())
                .build();
    }
}
