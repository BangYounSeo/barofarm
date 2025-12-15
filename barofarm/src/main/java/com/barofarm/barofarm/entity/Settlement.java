package com.barofarm.barofarm.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Entity
@Data
public class Settlement {

	@Id
	@GeneratedValue
	private long settlementId;
	
	private int totalAmount;
	
	private int commissionAmount;
	
	private int settlementAmount;
	
	private LocalDateTime scheduleDate;
	
	private LocalDateTime completedAt;
	
	private LocalDate periodStart;
	
	private LocalDate periodEnd;
	
	private String status;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "proId")
	private Producer producer;
	
	@OneToMany(mappedBy = "settlement")
	@JsonIgnore
	private List<SettlementDetail> details = new ArrayList<>();
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "transactionId")
	private PlatformAmountTransaction platformAmountTransaction;
	
}
