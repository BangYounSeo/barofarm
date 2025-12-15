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
public class QnaBoard {

	@Id
	@GeneratedValue
	@Column(name="numQna")
	private int numQna;
	
	private String subject;
	
	private String content;
	
	@CreationTimestamp
	private LocalDateTime created;
	
	@Column(columnDefinition = "varchar2(20) default 'ready'")
	private String status;
	
	private String answerContent;
	
	private String answerBy; 
	
	private LocalDateTime answerAt;
	
	 // ⭐⭐⭐ 추가해야 하는 부분(상품 q&a 작성 시 공개 비공개)!!!
    @Column(columnDefinition = "char(1) default 'N'")
    private String isSecret;   // 공개/비공개 (Y/N)
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="userId")
	private Member member;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="numBrd")
	private SalesBoard salesBoard;
}
