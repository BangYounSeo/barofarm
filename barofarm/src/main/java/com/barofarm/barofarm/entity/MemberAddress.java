package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;

import lombok.Data;

@Entity
@Data
public class MemberAddress {

	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "MEMBER_ADDRESS_SEQ_GEN")
	@SequenceGenerator(
		name = "MEMBER_ADDRESS_SEQ_GEN",
		sequenceName = "MEMBER_ADDRESS_SEQ",
		allocationSize = 1
	)
    private Long addressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    private Member member;

    private String alias;		//배송지 별칭
    private String receiver;	//받는사람
    private String phone;
    private String postalCode;
    private String addr1;
    private String addr2;

    @Column(columnDefinition = "number(1) default 0")
    private int isDefault;

    @Column(columnDefinition = "number(1) default 0")
    private int deleted;

    private LocalDateTime lastUsedAt;

    @Column(columnDefinition = "number(10) default 0")
    private int usedCount;		//주문횟수
	
}
