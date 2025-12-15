package com.barofarm.barofarm.dto.member;

import com.barofarm.barofarm.Enum.UserType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyInfoDTO {
	
	private String email;
	private String phone;
	private String name;
	private String userType;
	private String userId;
	
	public static MyInfoDTO from(CustomUserDetails user) {
		return MyInfoDTO.builder()
				.email(user.getEmail())
				.phone(user.getPhone())
				.name(user.getName())
				.userType(user.getUserType())
				.userId(user.getUsername())
				.build();
	}
}
