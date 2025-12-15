package com.barofarm.barofarm.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final CustomOauth2UserService customOauth2UserService;
	private final Oauth2AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler;

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();

        // 프론트 주소 허용 (필요한 주소만 적어줘)
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
        		 "http://192.168.0.34:3000"
        ));
        // 모든 헤더 허용
        config.setAllowedHeaders(Arrays.asList("*"));
        // 허용할 HTTP 메서드
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
        // 쿠키/인증정보 포함 허용 여부 (필요 없으면 안 써도 됨)
        config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		// 모든 경로에 이 설정 적용
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	@Bean
	protected SecurityFilterChain configure(HttpSecurity http) throws Exception {
		http
				.csrf().disable()
				.cors().and()
				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests()
				.antMatchers(
						"/api/member/**",
						"/api/salesboard/**",
						"/api/salesboard/popular",
						"/api/salesboard/best",   
					    "/api/salesboard/new", 
						"/api/productItems/**",
						"/api/salesboard", "/api/daily/**",
						"/api/detail/**", "/api/easy-price/**",
						"/api/daily/sales/list/**", "/api/price/**",
						"/api/cart/**", "/api/upload/**", "/static/**",
						"/api/notice/**",
						"/api/payment/webhook", "/api/payment/order", "/api/payment/setAdd/**",
						"/api/payment/getAdd/**", "/api/payment/**",
						"/api/payment/confirm", "/api/payment/verify", "/api/data/**",
						"/api/popups/**",
						"/api/notice/**",
						"/api/banner/**","/actuator/health", "/actuator/health/**"
						
						)
				.permitAll()
				
				// ⭐ 리뷰 수정/삭제는 인증 필요
				.antMatchers(HttpMethod.POST, "/api/review/update/**").authenticated()
				.antMatchers(HttpMethod.DELETE, "/api/review/**").authenticated()

				// ⭐ 관리자 전용 API
				.antMatchers("/api/admin/**").hasRole("ADMIN")
				// 또는 hasAuthority("ROLE_ADMIN") 도 가능
				// .antMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
				
				// ⭐ Producer 정책
				.antMatchers(HttpMethod.GET, "/api/producer/profile").authenticated()
				.antMatchers(HttpMethod.PUT, "/api/producer/profile").authenticated()

				// ⭐ QnA 답변 등록/삭제는 인증 필수
				.antMatchers(HttpMethod.POST, "/api/salesboard/qna/**/answer").authenticated()
				.antMatchers(HttpMethod.DELETE, "/api/salesboard/qna/**/answer").authenticated()

				// ⭐ QnA 문의글 삭제도 인증 필요!
				.antMatchers(HttpMethod.DELETE, "/api/salesboard/qna/**").authenticated()
				// ⭐ 리뷰 조회(GET)는 비로그인 허용
				.antMatchers(HttpMethod.GET, "/api/review/**").permitAll()

				// ⭐ 리뷰 좋아요 정책
				.antMatchers(HttpMethod.GET, "/api/review/**/good").permitAll()
				.antMatchers(HttpMethod.POST, "/api/review/**/good").authenticated()
				// ⭐ 리뷰 신고 (POST → 로그인 필요)
				.antMatchers(HttpMethod.POST, "/api/review/**/report").authenticated()
				// 찜(Wishlist) 정책
				.antMatchers(HttpMethod.GET, "/api/wishlist").authenticated() // 찜 목록 조회 허용
				.antMatchers(HttpMethod.GET, "/api/wishlist/**").authenticated()
				.antMatchers(HttpMethod.POST, "/api/wishlist/**").authenticated()
				.antMatchers(HttpMethod.DELETE, "/api/wishlist/**").authenticated()

				.anyRequest().authenticated()
				.and()
				.formLogin().disable()
				.httpBasic().disable()
				.oauth2Login(oauth2 -> oauth2
						.userInfoEndpoint(userInfo -> userInfo.userService(customOauth2UserService))
						.successHandler(oauth2AuthenticationSuccessHandler));

		http.addFilterBefore(jwtAuthenticationFilter,
				UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

}
