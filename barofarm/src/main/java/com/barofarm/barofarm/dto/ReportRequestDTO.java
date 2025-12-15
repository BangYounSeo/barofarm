package com.barofarm.barofarm.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportRequestDTO {

    // 라디오에서 선택한 기본 사유
    private String reasonCode;

    // 텍스트입력 (선택)
    private String detail;
}
