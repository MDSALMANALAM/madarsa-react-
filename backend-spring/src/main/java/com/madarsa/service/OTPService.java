package com.madarsa.service;

import com.madarsa.model.OTP;
import com.madarsa.repository.OTPRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OTPService {
    
    private final OTPRepository otpRepository;
    private final SecureRandom random = new SecureRandom();
    
    public String createOTP(String email, String purpose) {
        // Delete existing OTPs for this email and purpose
        otpRepository.deleteByEmailAndPurpose(email.toLowerCase(), purpose);
        
        // Generate 6-digit OTP
        String otpCode = String.format("%06d", random.nextInt(1000000));
        
        OTP otp = new OTP();
        otp.setEmail(email.toLowerCase());
        otp.setOtp(otpCode);
        otp.setPurpose(purpose);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(10)); // 10 minutes expiry
        otp.setCreatedAt(LocalDateTime.now());
        
        otpRepository.save(otp);
        
        return otpCode;
    }
    
    public OTPVerifyResult verifyOTP(String email, String otpCode, String purpose) {
        Optional<OTP> otpOpt = otpRepository.findByEmailAndPurposeAndIsUsedFalse(
            email.toLowerCase(), purpose
        );
        
        if (otpOpt.isEmpty()) {
            return new OTPVerifyResult(false, "OTP not found or expired");
        }
        
        OTP otp = otpOpt.get();
        
        // Check expiry
        if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
            return new OTPVerifyResult(false, "OTP has expired");
        }
        
        // Check attempts
        if (otp.getAttempts() >= 5) {
            return new OTPVerifyResult(false, "Too many attempts. Please request a new OTP.");
        }
        
        // Verify OTP
        if (!otp.getOtp().equals(otpCode)) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            return new OTPVerifyResult(false, "Invalid OTP");
        }
        
        // Mark as used
        otp.setUsed(true);
        otpRepository.save(otp);
        
        return new OTPVerifyResult(true, "OTP verified successfully");
    }
    
    public boolean checkOTPExists(String email, String purpose) {
        Optional<OTP> otp = otpRepository.findByEmailAndPurposeAndIsUsedFalse(
            email.toLowerCase(), purpose
        );
        return otp.isPresent() && otp.get().isUsed();
    }
    
    public record OTPVerifyResult(boolean isValid, String message) {}
}

