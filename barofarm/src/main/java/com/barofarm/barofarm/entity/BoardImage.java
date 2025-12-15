package com.barofarm.barofarm.entity;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class BoardImage {

	@Id
	@GeneratedValue
	private int numBrdImg;
	
	private String originalFileName;
	
	private String saveFileName;
	
	private String path;
	
	private String isThumbnail;
	
	private int sortOrder;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="numBrd")
	private SalesBoard salesBoard;
	
}
