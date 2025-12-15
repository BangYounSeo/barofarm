package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;

import com.barofarm.barofarm.Enum.PurchaseDetailStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class PurchaseDetail {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "purd_seq_gen")
	@SequenceGenerator(
	    name = "purd_seq_gen",        // JPA에서 사용할 이름
	    sequenceName = "PURD_SEQ",   // DB에 생성할 시퀀스 이름
	    allocationSize = 1            // 시퀀스 증가 단위 (1씩 증가)
	)
	@Column(name="numPurD")
	private int numPurD;
	
	private int quantity;
	
	private int unitPrice;
	
	private int finalPrice;
	
	private String trackingNo;
	
	private LocalDateTime shippingStartedAt;
	private LocalDateTime shippingCompletedAt;
	private boolean holdReleased = false;
	private String refundReason;

	@Enumerated(EnumType.STRING)
	@Column(length=20)
	private PurchaseDetailStatus status; //readypay,paid,readyship,shipping,complete,cancel,refunding,refunded
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="numBrd")
	private SalesBoard salesBoard;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="numPurG")
	private PurchaseGroup purchaseGroup;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="numOptD")
	private SalesOptionDetail salesOptionDetail;
	
	@OneToOne(mappedBy = "purchaseDetail", fetch = FetchType.LAZY)
	private Review review;
	
	@OneToOne(mappedBy = "purchaseDetail", fetch = FetchType.LAZY)
	private SettlementDetail settlementDetail;
	
	@OneToMany(mappedBy = "purchaseDetail")
	@JsonIgnore
	private List<PlatformAmountTransaction> transaction = new ArrayList<>();
		
}
