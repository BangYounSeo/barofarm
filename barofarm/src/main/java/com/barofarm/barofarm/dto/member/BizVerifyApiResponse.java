package com.barofarm.barofarm.dto.member;

import java.util.List;

import lombok.Data;

@Data
public class BizVerifyApiResponse {
	
	private String status_code;
    private List<BizVerifyResult> data;

}
