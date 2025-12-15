package com.barofarm.barofarm.security;

import java.io.IOException;
import java.util.Collections;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.barofarm.barofarm.dto.member.CustomUserDetails;
import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter{

	private final JwtTokenProvider jwtTokenProvider;
	private final MemberRepository memberRepository;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain filterChain)
            		throws ServletException, IOException {
	
		String token = resolveToken(request);
	
		if (token != null && jwtTokenProvider.validateToken(token)) {
			String userId = jwtTokenProvider.getUserId(token);
			String role = jwtTokenProvider.getRole(token);
			
			Member member =  memberRepository.findByUserId(userId).orElse(null);
			
			if(member !=null) {
				CustomUserDetails userDetails = new CustomUserDetails(member);
				
				// 여기서는 간단히 ROLE_USER 하나만 줌
				Authentication auth = new UsernamePasswordAuthenticationToken(
					userDetails, null,
					Collections.singleton(new SimpleGrantedAuthority(role))
				);
				
				SecurityContextHolder.getContext().setAuthentication(auth);
			}
		}
	
		filterChain.doFilter(request, response);
	}
	
	private String resolveToken(HttpServletRequest request) {
		String bearer = request.getHeader("Authorization");
		
		if (bearer != null && bearer.startsWith("Bearer ")) {
			return bearer.substring(7);
		}
		
		return null;
	}
}
