 package com.barofarm.barofarm.entity;

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

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class SalesOptionDetail {

	@Id
	@GeneratedValue
	@Column(name="numOptD")
	private int numOptD;
	
	@Column(nullable = false)
	private Integer enabled; // 1: 판매중, 0: 품절
	
	private Integer stock;
	
	private Integer price;
	
    // ⭐ 옵션 이름 필드 추가
    private String optionName;
	
	private String name;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="numOptG")
	private SalesOptionGroup salesOptionGroup;
	
	@OneToMany(mappedBy = "salesOptionDetail")
	private List<PurchaseDetail> purchaseDetails = new ArrayList<PurchaseDetail>();
	
	@OneToMany(mappedBy = "salesOptionDetail")
	private List<Cart> carts = new ArrayList<Cart>();
}
