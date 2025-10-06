package com.academy.football_academy_backend.util;

import com.africastalking.AfricasTalking;
import com.africastalking.SmsService;
import com.africastalking.sms.Recipient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SmsClient {
    private final SmsService smsService;

    public SmsClient(@Value("${africastalking.api-key}") String apiKey,
                     @Value("${africastalking.username}") String username,
                     @Value("${africastalking.from}") String from) {
        AfricasTalking.initialize(username, apiKey);
        this.smsService = AfricasTalking.getService(AfricasTalking.SERVICE_SMS);
    }

    public boolean sendSms(String phoneNumber, String message) {
        try {
            List<Recipient> response = smsService.send(message, new String[]{phoneNumber}, true);
            // Optional: Check for failures
            boolean allSuccessful = response.stream().allMatch(r -> "Success".equals(r.status));
            return allSuccessful;
        } catch (Exception e) {
            // Log error: log.error("SMS send failed", e);
            return false;
        }
    }
}
