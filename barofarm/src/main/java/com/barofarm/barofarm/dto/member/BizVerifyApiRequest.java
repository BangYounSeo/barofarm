package com.barofarm.barofarm.dto.member;

import java.util.List;

import lombok.Data;

@Data
public class BizVerifyApiRequest {
	
	private List<BizVerifyRequest> businesses;
}
