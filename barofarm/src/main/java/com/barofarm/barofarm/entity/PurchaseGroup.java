package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

import org.hibernate.annotations.CreationTimestamp;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class PurchaseGroup {

	@Id
	@GeneratedValue
	@Column(name="numPurG")
	private int numPurG;
	
	@CreationTimestamp
	private LocalDateTime orderDate;
	
	@Column(columnDefinition = "varchar2(50) default 'readypay'")
	private String status;
	
	private int totalPrice;
	
	@Column(unique = true, nullable = false)
	private String merchantUid;
	
	private String paymentStatus;
	
	private LocalDateTime paidAt;
	
	private LocalDateTime canceledAt;
	
	@Column(nullable = false)
	private String receiverName;
	
	@Column(nullable = false)
	private String receiverPhone;
	
	@Column(nullable = false)
	private String receiverPostalCode;
	
	@Column(nullable = false)
	private String receiverAddr1;
	
	private String receiverAddr2;
	
	private LocalDateTime shippingRequest;
	
	@OneToMany(mappedBy = "purchaseGroup")
	private List<PurchaseDetail> purchaseDetails = new ArrayList<PurchaseDetail>();
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="userId")
	private Member member;
	
	@OneToOne(mappedBy = "purchaseGroup", fetch = FetchType.LAZY)
    private Payment payment;
	
}
