package com.barofarm.barofarm.dto.member;

import java.util.Arrays;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.barofarm.barofarm.Enum.AccountStatus;
import com.barofarm.barofarm.Enum.UserType;
import com.barofarm.barofarm.entity.Member;

import lombok.Getter;

@Getter
public class CustomUserDetails implements UserDetails{

	private final Member member;
	
	public CustomUserDetails(Member member) {
		this.member = member;
	}
	
	@Override
	public String getUsername() {
		return member.getUserId();
	}
	
	@Override
	public String getPassword() {
		return member.getPwd();
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Arrays.asList(new SimpleGrantedAuthority(member.getRole().name()));
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return member.getStatus()==AccountStatus.ACTIVE;
	}
	
	public String getName() {
		return member.getName();
	}
	
	public String getPhone() {
		return member.getPhone();
	}
	
	public String getUserType() {
		return member.getUserType().name();
	}
	
	public String getEmail() {
		return member.getEmail();
	}
}
