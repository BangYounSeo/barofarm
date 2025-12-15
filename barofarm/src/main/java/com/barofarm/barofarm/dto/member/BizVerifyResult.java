package com.barofarm.barofarm.dto.member;

import lombok.Data;

@Data
public class BizVerifyResult {
	
	private String b_no;
    private String valid;       // "01": 일치, "02": 불일치, "03": 미등록 ...
    private String valid_msg;   // 메시지
    private BizVerifyStatus status;

}
