package com.madarsa.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Slf4j
@Service
public class WhatsAppService {
    
    @Value("${whatsapp.cloud.phone-number-id}")
    private String phoneNumberId;
    
    @Value("${whatsapp.cloud.access-token}")
    private String accessToken;
    
    @Value("${whatsapp.cloud.api-version:v18.0}")
    private String apiVersion;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    private String getApiUrl() {
        return String.format("https://graph.facebook.com/%s/%s/messages", apiVersion, phoneNumberId);
    }
    
    public boolean sendTextMessage(String to, String message) {
        try {
            String phoneNumber = formatPhoneNumber(to);
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("recipient_type", "individual");
            payload.put("to", phoneNumber);
            payload.put("type", "text");
            payload.put("text", Map.of("preview_url", false, "body", message));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(getApiUrl(), request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("WhatsApp message sent to: {}", phoneNumber);
                return true;
            }
            
            log.error("Failed to send WhatsApp message: {}", response.getBody());
            return false;
            
        } catch (Exception e) {
            log.error("Error sending WhatsApp message to: {}", to, e);
            return false;
        }
    }
    
    public boolean sendTemplateMessage(String to, String templateName, String languageCode, List<String> parameters) {
        try {
            String phoneNumber = formatPhoneNumber(to);
            
            List<Map<String, Object>> components = new ArrayList<>();
            if (parameters != null && !parameters.isEmpty()) {
                List<Map<String, String>> params = new ArrayList<>();
                for (String param : parameters) {
                    params.add(Map.of("type", "text", "text", param));
                }
                components.add(Map.of("type", "body", "parameters", params));
            }
            
            Map<String, Object> template = new HashMap<>();
            template.put("name", templateName);
            template.put("language", Map.of("code", languageCode));
            if (!components.isEmpty()) {
                template.put("components", components);
            }
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("to", phoneNumber);
            payload.put("type", "template");
            payload.put("template", template);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(getApiUrl(), request, Map.class);
            
            return response.getStatusCode().is2xxSuccessful();
            
        } catch (Exception e) {
            log.error("Error sending WhatsApp template to: {}", to, e);
            return false;
        }
    }
    
    public void sendAdmissionNotification(String parentPhone, String studentName, String status) {
        String message = String.format(
            "🕌 Madarsa Imdadul Uloom\n\n" +
            "Assalamu Alaikum!\n\n" +
            "Admission update for *%s*:\n" +
            "Status: *%s*\n\n" +
            "JazakAllah Khair",
            studentName, status.toUpperCase()
        );
        sendTextMessage(parentPhone, message);
    }
    
    public void sendFeeReminder(String parentPhone, String studentName, Double amount) {
        String message = String.format(
            "🕌 Madarsa Imdadul Uloom\n\n" +
            "Fee Reminder for *%s*\n" +
            "Amount Due: ₹%.2f\n\n" +
            "Please pay at the earliest.\n" +
            "JazakAllah Khair",
            studentName, amount
        );
        sendTextMessage(parentPhone, message);
    }
    
    private String formatPhoneNumber(String phone) {
        String cleaned = phone.replaceAll("[^0-9]", "");
        if (!cleaned.startsWith("91") && cleaned.length() == 10) {
            cleaned = "91" + cleaned;
        }
        return cleaned;
    }
}

