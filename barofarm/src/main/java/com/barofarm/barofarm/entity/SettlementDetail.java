package com.barofarm.barofarm.entity;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import lombok.Data;

@Entity
@Data
public class SettlementDetail {

	@Id
	@GeneratedValue
	private long detailId;
	
	private int orderAmount;
	
	private int platformFee;
	
	private int amountForProducer;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "settlementId")
	private Settlement settlement;
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "numPurD")
	private PurchaseDetail purchaseDetail;
}
