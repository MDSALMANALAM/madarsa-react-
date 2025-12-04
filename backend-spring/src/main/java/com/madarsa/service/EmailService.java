package com.madarsa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    public void sendOtpEmail(String to, String otp, String purpose) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Madarsa Imdadul Uloom - OTP Verification");
            
            String content;
            if ("registration".equals(purpose)) {
                content = String.format(
                    "Assalamu Alaikum,\n\n" +
                    "Your OTP for registration at Madarsa Imdadul Uloom is: %s\n\n" +
                    "This OTP is valid for 10 minutes.\n\n" +
                    "If you did not request this, please ignore this email.\n\n" +
                    "JazakAllah Khair,\n" +
                    "Madarsa Imdadul Uloom",
                    otp
                );
            } else {
                content = String.format(
                    "Assalamu Alaikum,\n\n" +
                    "Your OTP for login at Madarsa Imdadul Uloom is: %s\n\n" +
                    "This OTP is valid for 10 minutes.\n\n" +
                    "If you did not request this, please secure your account.\n\n" +
                    "JazakAllah Khair,\n" +
                    "Madarsa Imdadul Uloom",
                    otp
                );
            }
            
            message.setText(content);
            mailSender.send(message);
            
            log.info("OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", to, e);
        }
    }
    
    public void sendWelcomeEmail(String to, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Welcome to Madarsa Imdadul Uloom");
            message.setText(String.format(
                "Assalamu Alaikum %s,\n\n" +
                "Welcome to Madarsa Imdadul Uloom!\n\n" +
                "Your account has been created successfully.\n\n" +
                "JazakAllah Khair,\n" +
                "Madarsa Imdadul Uloom Team",
                name
            ));
            mailSender.send(message);
            
            log.info("Welcome email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", to, e);
        }
    }
    
    public void sendApprovalEmail(String to, String name, boolean approved, String reason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            
            if (approved) {
                message.setSubject("Account Approved - Madarsa Imdadul Uloom");
                message.setText(String.format(
                    "Assalamu Alaikum %s,\n\n" +
                    "Congratulations! Your account has been approved.\n\n" +
                    "You can now login to access your dashboard.\n\n" +
                    "JazakAllah Khair,\n" +
                    "Madarsa Imdadul Uloom",
                    name
                ));
            } else {
                message.setSubject("Account Status Update - Madarsa Imdadul Uloom");
                message.setText(String.format(
                    "Assalamu Alaikum %s,\n\n" +
                    "Your account registration was not approved.\n\n" +
                    "Reason: %s\n\n" +
                    "Please contact administration for more details.\n\n" +
                    "JazakAllah Khair,\n" +
                    "Madarsa Imdadul Uloom",
                    name, reason != null ? reason : "Not specified"
                ));
            }
            
            mailSender.send(message);
            log.info("Approval email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send approval email to: {}", to, e);
        }
    }
}

