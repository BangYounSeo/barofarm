package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import org.hibernate.annotations.CreationTimestamp;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Cart {

	@Id
	@GeneratedValue
	@Column(name="cartId")
	private int cartId;
	
	@Column(name = "product_image")
	private String productImage;   // ⭐ 추가
	
	@Column(name="OPTION_NAME")
	private String optionName;  //옵션명 추가
	
	private int quantity;
	
	private int unitPriceSnapshot;
	
	@CreationTimestamp
	private LocalDateTime created;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="userId")
	private Member member;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="numBrd")
	private SalesBoard salesBoard;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="numOptD")
	private SalesOptionDetail salesOptionDetail;
}
