package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:admin@madarsa.com}")
    private String adminEmail;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitContactForm(@RequestBody Map<String, String> form) {
        try {
            String name = form.get("name");
            String email = form.get("email");
            String phone = form.get("phone");
            String subject = form.get("subject");
            String message = form.get("message");
            
            // Send email to admin
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(adminEmail);
            mailMessage.setSubject("Contact Form: " + (subject != null ? subject : "No Subject"));
            mailMessage.setText(String.format(
                "New Contact Form Submission\n\n" +
                "Name: %s\n" +
                "Email: %s\n" +
                "Phone: %s\n" +
                "Subject: %s\n\n" +
                "Message:\n%s",
                name, email, phone, subject, message
            ));
            
            mailSender.send(mailMessage);
            
            log.info("Contact form submitted by: {}", email);
            return ResponseEntity.ok(ApiResponse.success("Message sent successfully"));
            
        } catch (Exception e) {
            log.error("Failed to send contact form", e);
            return ResponseEntity.ok(ApiResponse.error("Failed to send message"));
        }
    }
}

