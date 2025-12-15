package com.barofarm.barofarm.entity;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Producer {

	@Id
	@GeneratedValue
	private Long proId;
	
	private String producerType;
	
	private String farmName;
	
	private String callCenter;
	
	private LocalTime startCall;
	
	private LocalTime endCall;
	
	private String postalCode; //우편번호
	
	private String addr1; // 기본주소
	
	private String addr2; //상세주소
	
	private String intro; //소개글
	
	private String bank;
	
	private String accountNumber;
	
	private String accountHolder;
	
	private String settleEmail;
	
	
	private String status = "PENDING"; //Pending,approved,rejected
	
	 private String courier;             // 판매자 지정 택배사
	 private Integer returnShippingFee;  // 반품 배송비 (원)
	 private Integer exchangeShippingFee; // 교환 배송비 (원)
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="userId")
	private Member member;
	
	@OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	@JoinColumn(name="bizRegId")
	private BusinessRegistration businessRegistration;
	
	@OneToMany(mappedBy = "producer")
	@JsonIgnore
	private List<SalesBoard> boards = new ArrayList<>();

	@Column(length = 500)
	private String reason; //승인/반려/보류 사유 
}
