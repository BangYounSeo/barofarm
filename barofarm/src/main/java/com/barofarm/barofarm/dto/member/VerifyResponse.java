package com.barofarm.barofarm.dto.member;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerifyResponse {

	private boolean success;
	private String message;
}
