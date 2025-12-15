package com.barofarm.barofarm.entity;

import javax.persistence.Entity;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ProductItems {
	
	@Id
	private int itemCode;
	
	private int categoryCode;
	
	private String itemName;
	
}
