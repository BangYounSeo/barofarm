package com.barofarm.barofarm.dto.salesBoard;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import com.barofarm.barofarm.entity.SalesOptionGroup;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionGroupDTO {

    // 저장용 필드
    private String groupName; // 저장 시 사용할 그룹명
    private List<OptionDetailDTO> details; // 저장 시 함께 들어올 옵션 상세 목록

    // 조회용 필드
    private int numOptG; // DB PK
    private String name; // 조회 시 사용할 그룹명
    

    /** Entity → DTO 변환 메서드 (조회용) */
    public static OptionGroupDTO from(SalesOptionGroup entity) {
        return OptionGroupDTO.builder()
                .numOptG(entity.getNumOptG())
                .name(entity.getName())
                .build();
    }
}
