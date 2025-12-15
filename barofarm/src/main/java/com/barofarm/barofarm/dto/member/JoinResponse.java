package com.barofarm.barofarm.dto.member;

import com.barofarm.barofarm.entity.Member;

import lombok.Data;

@Data
public class JoinResponse {

	private String userId;
	
	public JoinResponse(Member member) {
		this.userId = member.getUserId();
	}
}
