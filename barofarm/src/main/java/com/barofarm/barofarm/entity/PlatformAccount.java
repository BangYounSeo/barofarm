package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import org.hibernate.annotations.UpdateTimestamp;

import lombok.Data;

@Entity
@Data
public class PlatformAccount {
	
	@Id
	@GeneratedValue
	private long accountId;
	
	private int balance;
	
	private int holdAmount;
	
	private int availableAmount;
	
	@UpdateTimestamp
	private LocalDateTime updated;
	
}
