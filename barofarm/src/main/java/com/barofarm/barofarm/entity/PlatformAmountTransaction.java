package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import org.hibernate.annotations.CreationTimestamp;

import com.barofarm.barofarm.Enum.TransactionType;

import lombok.Data;

@Entity
@Data
public class PlatformAmountTransaction {
	
	@Id
	@GeneratedValue
	private long transactionId;
	
	@Enumerated(EnumType.STRING)
	private TransactionType type;
	
	private int amount;
	
	private int balanceAfter;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "numPurD")
	private PurchaseDetail purchaseDetail;
	
	@OneToOne(mappedBy = "platformAmountTransaction",fetch = FetchType.LAZY)
	private Settlement settlement;
	
	private String memo;
	
	@CreationTimestamp
	private LocalDateTime createdAt;
	
}
