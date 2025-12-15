package com.barofarm.barofarm.entity;

import javax.persistence.Column;
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
public class ReviewImage {

	@Id
	@GeneratedValue
	private int numRevImg;
	
	@Column(name = "ORIGINAL_FILE_NAME")
	private String originalFileName;
	
	@Column(name = "SAVE_FILE_NAME")
	private String saveFileName;
	
	private String path;
	
	private String isThumbnail;
	
	private int sortOrder;
	
	// ⭐⭐⭐ 신규 추가 (S3 URL 저장)
    @Column(name = "URL")
    private String url;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="numRev")
	private Review review;
}
