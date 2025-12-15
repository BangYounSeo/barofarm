package com.barofarm.barofarm.dto.member;

import com.barofarm.barofarm.entity.Member;

import lombok.Data;

@Data
public class LoginResponse {
	public String token;
	public String name;
	public int tempPwd;
	public String status;
	public String userType;
	
	public LoginResponse(String token,Member member) {
		this.token = token;
		this.name = member.getName();
		this.tempPwd = member.getTempPwd();
		this.status = member.getStatus().name();
		this.userType = member.getUserType().name();
	}

}
