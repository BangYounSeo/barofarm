package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class SalesBoard {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salesBoardSeq")
	@SequenceGenerator(
	        name = "salesBoardSeq",
	        sequenceName = "SALES_BOARD_SEQ",
	        allocationSize = 1
	)
	private int numBrd;
	
	private String subject;
	
	@Lob
	@Column(columnDefinition = "CLOB")
	private String content;
	
	private String productType;
	
	private int productItem;
	
	@Column(columnDefinition = "varchar2(20) default 'common'")
	private String status;
	
	@CreationTimestamp
	private LocalDateTime created;
	
	private String origin;
	
	@Column(columnDefinition = "number(10) default 0")
	private int hitCount;
	
	@UpdateTimestamp
	private LocalDateTime updated;
	
	private int price;
	
	private int stock;
	
	// ⭐ 썸네일 이미지 경로 추가
	@Column(name = "thumbnail")
    private String thumbnail;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="userId")
	private Member member;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "proId")
	private Producer producer;
	
	@OneToMany(mappedBy = "salesBoard")
	private List<Review> reviews = new ArrayList<Review>();
	
	@OneToMany(mappedBy = "salesBoard")
	private List<PurchaseDetail> purchaseDetails = new ArrayList<PurchaseDetail>();
	
	@OneToMany(mappedBy = "salesBoard")
	private List<BoardImage> boardImages = new ArrayList<BoardImage>();
	
	@OneToMany(mappedBy = "salesBoard")
	private List<SalesOptionGroup> salesOptionGroups = 
											new ArrayList<SalesOptionGroup>();
	
	@OneToMany(mappedBy = "salesBoard")
	private List<Cart> carts = new ArrayList<Cart>();
	
	@OneToMany(mappedBy = "salesBoard")
	private List<QnaBoard> qnaBoards = new ArrayList<QnaBoard>();
}
