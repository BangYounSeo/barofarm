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
public class ReportDetail {

	@Id
	@GeneratedValue
	@Column(name="reportId")
	private int numRep;
	
	private String targetType;
	
	private String targetId;
	
	private String reason;
	
	@Column(columnDefinition = "varchar(20) default 'ready'")
	private String status;
    
	// ✅ 상태 변경 사유 (관리자 메모)
    @Column(length = 500)
    private String statusReason;

	@CreationTimestamp
	private LocalDateTime created;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="userId")
	private Member member;
}
