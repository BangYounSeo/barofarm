package com.barofarm.barofarm.dto.admin;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdminMemberDTO {
    private String userId;
	private String pwd;      
    private String name;
    private String phone;  
    private String email;
    private String role;
    private String userType;
    private String status;        //ACTIVE, BLOCK
    private LocalDateTime created;
    private LocalDateTime updated;


}