package com.barofarm.barofarm.dto.admin;

import java.time.LocalDate;

import lombok.Data;

@Data
public class SignupStatDTO {
    private LocalDate date; //일주일 가입통계
    private Long count;
    
}
