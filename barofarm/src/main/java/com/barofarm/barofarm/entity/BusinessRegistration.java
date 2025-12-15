package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class BusinessRegistration {

	@Id
	@GeneratedValue
	private Long id;
	
	private String bizNo;				//사업자등록번호
	private String ceoName;				//대표자
	private String openDate;			//개업일자
	
	private Boolean verified;
	private String statusCode;			//국세청 상태 코드
	private String statusMessage;		//상태 메세지
	private LocalDateTime verifiedAt;
	
}
