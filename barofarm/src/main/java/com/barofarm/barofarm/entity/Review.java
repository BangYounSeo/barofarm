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
public class Review {
	
	@Id
	@GeneratedValue
	private int numRev;
	
	private String content;
	
	@Column(columnDefinition = "number(1) default 0")
	private int grade;
	
	@CreationTimestamp
	private LocalDateTime created;
	
	private Integer parent;
	private int orderNum;
	private int groupNum;
	private int depth;
	
	@Column(columnDefinition = "varchar(20) default 'common'")
	private String status;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="userId")
	private Member member;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="numBrd")
	private SalesBoard salesBoard;
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "numPurD",unique = true)
	private PurchaseDetail purchaseDetail;
	
	// ✅ EAGER로 변경
		@OneToMany(mappedBy = "review", fetch = FetchType.EAGER)
		private List<ReviewImage> reviewImages = new ArrayList<ReviewImage>();
	
}
