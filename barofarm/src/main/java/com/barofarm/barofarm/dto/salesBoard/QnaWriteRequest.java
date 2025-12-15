package com.barofarm.barofarm.dto.salesBoard;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor      // JSON → 객체 변환용
@AllArgsConstructor     // Service에서 편하게 생성
public class QnaWriteRequest {

    private int numBrd;
    private String content;
    private boolean secret;
}
