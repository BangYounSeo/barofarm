package com.barofarm.barofarm.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.OneToMany;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.barofarm.barofarm.Enum.AccountStatus;
import com.barofarm.barofarm.Enum.Role;
import com.barofarm.barofarm.Enum.UserType;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Member {

	@Id
	@Column(nullable = false, unique = true, length = 50, name = "userId")
	private String userId;
	
	private String pwd;
	
	private String name;
	
	private String phone;
	
	private String email;
	
	@Column(columnDefinition = "number(5) default 0")
	private int tempPwd;
	
	@Enumerated(EnumType.STRING)
	@Column(length=20)
	private AccountStatus status = AccountStatus.ACTIVE;
	
	@Enumerated(EnumType.STRING)
	private UserType userType = UserType.CONSUMER;
	
	@Enumerated(EnumType.STRING)
	private Role role = Role.ROLE_USER;
	
	@CreationTimestamp
	private LocalDateTime created;
	
	@UpdateTimestamp
	private LocalDateTime updated;
	
    @OneToMany(mappedBy = "member")
    @JsonIgnore
    private List<SalesBoard> salesBoards = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    @JsonIgnore
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    @JsonIgnore
    private List<PurchaseGroup> purchaseGroups = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    @JsonIgnore
    private List<Cart> carts = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    @JsonIgnore
    private List<Good> goods = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    @JsonIgnore
    private List<ReportDetail> reportDetails = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    @JsonIgnore
    private List<QnaBoard> qnaBoards = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    @JsonIgnore
    private List<Producer> producers = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    @JsonIgnore
    private List<MemberAddress> address = new ArrayList<>();
	
}

