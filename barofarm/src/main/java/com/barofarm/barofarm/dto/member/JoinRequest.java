package com.barofarm.barofarm.dto.member;

import lombok.Data;

@Data
public class JoinRequest {
	
	public String userId;
	public String pwd;
	public String name;
	public String phone;
	public String email;
}
