package com.barofarm.barofarm.smsVerify;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.exception.SolapiMessageNotReceivedException;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;

@Service
public class SolapiSmsService implements SmsService{

	private final DefaultMessageService messageService;
	
	@Value("${solapi.from}")
	private String fromNumber;
	
	public SolapiSmsService(
		@Value("${solapi.api-key}") String apiKey,
		@Value("${solapi.api-secret}") String apiSecret) {
		this.messageService = SolapiClient
				.INSTANCE.createInstance(apiKey, apiSecret);
	}
	
	@Override
	public void sendSms(String to,String text) {
		Message message = new Message();
        message.setFrom(fromNumber);
        message.setTo(to);
        message.setText(text);

        // 실제 발송
        try {
        	messageService.send(message);
        } catch (SolapiMessageNotReceivedException e) {
            System.out.println("[Solapi 발송실패 리스트] " + e.getFailedMessageList());
            throw new RuntimeException("SMS 발송 실패: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("SMS 발송 중 오류 발생: " + e.getMessage());
        }
	}
}
