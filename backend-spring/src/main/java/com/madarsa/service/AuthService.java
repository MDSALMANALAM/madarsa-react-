package com.madarsa.service;

import com.madarsa.dto.AuthRequest.*;
import com.madarsa.dto.AuthResponse;
import com.madarsa.dto.AuthResponse.UserDTO;
import com.madarsa.model.User;
import com.madarsa.repository.UserRepository;
import com.madarsa.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OTPService otpService;
    private final EmailService emailService;

    private static final List<String> VALID_USER_TYPES = Arrays.asList("student", "teacher", "parent", "general");

    public AuthResponse register(RegisterRequest request) {
        // Validate user type
        if (!VALID_USER_TYPES.contains(request.getUserType().toLowerCase())) {
            return AuthResponse.builder().success(false).message("Invalid user type").build();
        }

        // Block admin registration
        if ("admin".equalsIgnoreCase(request.getUserType())) {
            return AuthResponse.builder().success(false)
                .message("Admin registration is not allowed").build();
        }

        // Check existing user
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            return AuthResponse.builder().success(false).message("Email already registered").build();
        }
        if (userRepository.existsByMobile(request.getMobile())) {
            return AuthResponse.builder().success(false).message("Mobile already registered").build();
        }

        // Create user
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setMobile(request.getMobile().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUserType(request.getUserType().toUpperCase());
        user.setIsVerified(true);
        user.preSave();

        user = userRepository.save(user);

        // Response based on user type
        String userType = user.getUserType();
        if ("GENERAL".equalsIgnoreCase(userType) || "ADMIN".equalsIgnoreCase(userType)) {
            String token = jwtService.generateToken(user);
            return AuthResponse.builder()
                .success(true)
                .message("Registration successful")
                .token(token)
                .user(mapToDTO(user))
                .build();
        } else {
            return AuthResponse.builder()
                .success(true)
                .message("Registration successful! Your account is pending admin approval.")
                .requiresApproval(true)
                .user(mapToDTO(user))
                .build();
        }
    }

    public AuthResponse loginWithEmail(LoginEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return AuthResponse.builder().success(false).message("Invalid email or password").build();
        }

        return processLogin(user);
    }

    public AuthResponse loginWithMobile(LoginMobileRequest request) {
        User user = userRepository.findByMobile(request.getMobile()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return AuthResponse.builder().success(false).message("Invalid mobile or password").build();
        }

        return processLogin(user);
    }

    private AuthResponse processLogin(User user) {
        String userType = user.getUserType();
        // Check approval for non-admin/general users
        if (!"ADMIN".equalsIgnoreCase(userType) && !"GENERAL".equalsIgnoreCase(userType)) {
            Boolean isApproved = user.getIsApproved();
            if (isApproved == null || !isApproved) {
                String approvalStatus = user.getApprovalStatus();
                if ("REJECTED".equalsIgnoreCase(approvalStatus)) {
                    return AuthResponse.builder().success(false)
                        .message("Your account was rejected. Reason: " +
                            (user.getRejectionReason() != null ? user.getRejectionReason() : "Not specified"))
                        .approvalStatus("rejected").build();
                }
                return AuthResponse.builder().success(false)
                    .message("Your account is pending admin approval.")
                    .approvalStatus("pending").build();
            }
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
            .success(true)
            .message("Login successful")
            .token(token)
            .user(mapToDTO(user))
            .build();
    }

    private UserDTO mapToDTO(User user) {
        String userType = user.getUserType() != null ? user.getUserType().toLowerCase() : "general";
        Boolean isApproved = user.getIsApproved() != null ? user.getIsApproved() : false;
        String approvalStatus = user.getApprovalStatus() != null ? user.getApprovalStatus().toLowerCase() : "pending";

        return UserDTO.builder()
            .id(String.valueOf(user.getId()))
            .name(user.getName())
            .email(user.getEmail())
            .mobile(user.getMobile())
            .userType(userType)
            .isApproved(isApproved)
            .approvalStatus(approvalStatus)
            .build();
    }
}

