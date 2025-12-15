package com.barofarm.barofarm.security;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOauth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    private String cleanPhone(String phone) {
    	if(phone==null) return null;
    	return phone.replaceAll("[^0-9]", "");
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate =
                new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId(); // google, kakao, naver
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String userId = null;
        String email = null;
        String name = null;
        String phone = null;

        if ("google".equals(registrationId)) {
        	userId = (String) attributes.get("email");
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
        } else if ("kakao".equals(registrationId)) {
        	
        	Long kakaoId = ((Number)attributes.get("id")).longValue();
        	
        	userId = "kakao_" + kakaoId;
        	
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            
            if(kakaoAccount!=null) {
            	email = (String) kakaoAccount.get("email");
	            phone = cleanPhone((String) kakaoAccount.get("phone_number"));
	            
	            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
	            
	            if(kakaoAccount.get("name") != null) {
	            	name = (String) kakaoAccount.get("name");
	            }else if(profile != null) {
	            	name = (String) profile.get("nickName");
	            }
            }
        } else if ("naver".equals(registrationId)) {
            Map<String, Object> response = (Map<String, Object>) attributes.get("response");
            userId = (String) response.get("email");
            email = (String) response.get("email");
            name = (String) response.get("name");
            phone = cleanPhone((String) response.get("mobile"));
        }

        // 1) 우리 DB에 유저가 있으면 조회
        // 2) 없으면 새로 가입
        Member member = memberRepository.findByUserId(email)
                .orElse(null);
        
        if(member==null) {
        	member = new Member();
            member.setUserId(userId);
            member.setEmail(email);
            member.setName(name);
            member.setPhone(phone);
            String randomPassword = UUID.randomUUID().toString();
            member.setPwd(passwordEncoder.encode(randomPassword));
            member = memberRepository.save(member);
        }
        // Security context에 넣을 principal
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                userNameAttributeName
        );
    }
}
