package com.madarsa.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class AuthRequest {
    
    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;
        
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "Mobile is required")
        private String mobile;
        
        @NotBlank(message = "Password is required")
        private String password;
        
        @NotBlank(message = "User type is required")
        private String userType;
    }
    
    @Data
    public static class LoginEmailRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "Password is required")
        private String password;
    }
    
    @Data
    public static class LoginMobileRequest {
        @NotBlank(message = "Mobile is required")
        private String mobile;
        
        @NotBlank(message = "Password is required")
        private String password;
    }
    
    @Data
    public static class OTPRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
    }
    
    @Data
    public static class VerifyOTPRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "OTP is required")
        private String otp;
    }
}

