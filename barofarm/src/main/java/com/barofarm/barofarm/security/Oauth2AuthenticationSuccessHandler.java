package com.barofarm.barofarm.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class Oauth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider; // 이미 프로젝트에 있는 그 클래스

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String userId = null;
        
        if(oAuth2User.getAttributes().get("id")!=null) {
        	Long kakaoId = ((Number)oAuth2User.getAttributes().get("id")).longValue();
            userId = "kakao_" + kakaoId;
        }
        if (userId == null && oAuth2User.getAttributes().get("email") != null) {
            userId = (String) oAuth2User.getAttributes().get("email");
        }

        // 우리 시스템의 userId 가 email 이라면 그대로 사용
        String token = jwtTokenProvider.createToken(userId, "ROLE_USER");
        
        String targetUrl = UriComponentsBuilder
                .fromUriString("http://192.168.0.34:3000/oauth2/redirect")
                .queryParam("token", token)
                .queryParam("userId", userId)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
    
}
