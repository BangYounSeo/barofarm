package com.barofarm.barofarm.dto.member;

import com.barofarm.barofarm.entity.Member;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SearchIdPwdDTO {
	
	private String userId;
	private String phone;
	private String name;
	private String email;
	
	public SearchIdPwdDTO(Member member) {
		this.userId = member.getUserId();
		this.phone = member.getPhone();
		this.name = member.getName();
		this.email = member.getEmail();
	}

}
