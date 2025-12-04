package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import com.madarsa.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
public class WhatsAppController {
    
    private final WhatsAppService whatsAppService;
    
    @Value("${whatsapp.cloud.verify-token}")
    private String verifyToken;
    
    // Webhook verification (GET request from Meta)
    @GetMapping("/webhook")
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {
        
        if ("subscribe".equals(mode) && verifyToken.equals(token)) {
            log.info("WhatsApp webhook verified");
            return ResponseEntity.ok(challenge);
        }
        
        log.warn("WhatsApp webhook verification failed");
        return ResponseEntity.status(403).body("Verification failed");
    }
    
    // Webhook for incoming messages (POST request from Meta)
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        log.info("WhatsApp webhook received: {}", payload);
        
        // Process incoming messages
        try {
            if (payload.containsKey("entry")) {
                // Handle incoming message
                // This is where you'd process incoming WhatsApp messages
                log.info("Processing WhatsApp message");
            }
        } catch (Exception e) {
            log.error("Error processing WhatsApp webhook", e);
        }
        
        return ResponseEntity.ok("EVENT_RECEIVED");
    }
    
    // Admin endpoint to send message
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> sendMessage(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        String message = request.get("message");
        
        if (to == null || message == null) {
            return ResponseEntity.ok(ApiResponse.error("Phone number and message are required"));
        }
        
        boolean sent = whatsAppService.sendTextMessage(to, message);
        
        if (sent) {
            return ResponseEntity.ok(ApiResponse.success("Message sent successfully"));
        }
        return ResponseEntity.ok(ApiResponse.error("Failed to send message"));
    }
    
    // Send bulk messages
    @PostMapping("/send-bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendBulkMessages(
            @RequestBody Map<String, Object> request) {
        
        @SuppressWarnings("unchecked")
        java.util.List<String> phones = (java.util.List<String>) request.get("phones");
        String message = (String) request.get("message");
        
        if (phones == null || phones.isEmpty() || message == null) {
            return ResponseEntity.ok(ApiResponse.error("Phone numbers and message are required"));
        }
        
        int success = 0;
        int failed = 0;
        
        for (String phone : phones) {
            if (whatsAppService.sendTextMessage(phone, message)) {
                success++;
            } else {
                failed++;
            }
        }
        
        Map<String, Object> result = Map.of(
            "total", phones.size(),
            "success", success,
            "failed", failed
        );
        
        return ResponseEntity.ok(ApiResponse.success("Bulk messages sent", result));
    }
}

