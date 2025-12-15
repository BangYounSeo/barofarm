package com.barofarm.barofarm.dto.member;

import lombok.Data;

@Data
public class BizVerifyRequest {

	private String b_no;
	private String start_dt;
	private String p_nm;
	private String p_nm2 = "";
    private String b_nm = "";
    private String corp_no = "";
    private String b_sector = "";
    private String b_type = "";
    private String b_adr = "";
}
