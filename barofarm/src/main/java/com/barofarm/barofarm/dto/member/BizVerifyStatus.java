package com.barofarm.barofarm.dto.member;

import lombok.Data;

@Data
public class BizVerifyStatus {

	private String b_stt_cd;    // 01 계속, 02 휴업, 03 폐업
    private String b_stt;  
    private String tax_type;    // 과세유형
    private String tax_type_cd;
	
}
