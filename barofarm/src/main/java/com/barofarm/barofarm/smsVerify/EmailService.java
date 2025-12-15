package com.barofarm.barofarm.smsVerify;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EmailService {

	private final JavaMailSender mailSender;
	
	@Value("${spring.mail.username}")
	private String from;
	
	public void sendHtmlMail(String to, String subject, String html){
        try{
        	
        	System.out.println("mailSender = " + mailSender);
        	System.out.println("to = " + to);

        	MimeMessage mimeMessage = mailSender.createMimeMessage();
	        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
	
	        helper.setFrom(from);
	        helper.setTo(to);
	        helper.setSubject(subject);
	        helper.setText(html, true); // 두 번째 파라미터 true = HTML
	
	        mailSender.send(mimeMessage);
        }catch(MessagingException e) {
        	throw new IllegalStateException("메일 발송 중 오류가 발생했습니다.",e);
        }
    }
}
