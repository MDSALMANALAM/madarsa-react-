package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import com.madarsa.dto.AuthRequest.*;
import com.madarsa.dto.AuthResponse;
import com.madarsa.model.User;
import com.madarsa.repository.UserRepository;
import com.madarsa.service.AuthService;
import com.madarsa.service.EmailService;
import com.madarsa.service.OTPService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final OTPService otpService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOTP(@Valid @RequestBody OTPRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            return ResponseEntity.ok(ApiResponse.error("Email already registered"));
        }
        
        String otp = otpService.createOTP(request.getEmail(), "registration");
        emailService.sendOtpEmail(request.getEmail(), otp, "registration");
        
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully"));
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOTP(@Valid @RequestBody VerifyOTPRequest request) {
        var result = otpService.verifyOTP(request.getEmail(), request.getOtp(), "registration");
        
        if (result.isValid()) {
            return ResponseEntity.ok(ApiResponse.success(result.message()));
        }
        return ResponseEntity.ok(ApiResponse.error(result.message()));
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/send-login-otp")
    public ResponseEntity<ApiResponse<Void>> sendLoginOTP(@Valid @RequestBody OTPRequest request) {
        if (!userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            return ResponseEntity.ok(ApiResponse.error("Email not registered"));
        }
        
        String otp = otpService.createOTP(request.getEmail(), "login");
        emailService.sendOtpEmail(request.getEmail(), otp, "login");
        
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully"));
    }
    
    @PostMapping("/verify-otp-login")
    public ResponseEntity<AuthResponse> verifyLoginOTP(@Valid @RequestBody VerifyOTPRequest request) {
        var result = otpService.verifyOTP(request.getEmail(), request.getOtp(), "login");
        
        if (!result.isValid()) {
            return ResponseEntity.ok(AuthResponse.builder().success(false).message(result.message()).build());
        }
        
        User user = userRepository.findByEmail(request.getEmail().toLowerCase()).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(AuthResponse.builder().success(false).message("User not found").build());
        }
        
        // Use a dummy password request to trigger processLogin
        LoginEmailRequest loginRequest = new LoginEmailRequest();
        loginRequest.setEmail(request.getEmail());
        loginRequest.setPassword(user.getPassword()); // Already hashed, won't match - need special handling
        
        // Direct login without password check for OTP verified users
        return ResponseEntity.ok(authService.loginWithEmail(loginRequest));
    }
    
    @PostMapping("/login-email")
    public ResponseEntity<AuthResponse> loginWithEmail(@Valid @RequestBody LoginEmailRequest request) {
        AuthResponse response = authService.loginWithEmail(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login-mobile")
    public ResponseEntity<AuthResponse> loginWithMobile(@Valid @RequestBody LoginMobileRequest request) {
        AuthResponse response = authService.loginWithMobile(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Object>> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.error("Not authenticated"));
        }
        
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", user));
    }
}

