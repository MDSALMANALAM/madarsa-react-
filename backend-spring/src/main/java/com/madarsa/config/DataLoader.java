package com.madarsa.config;

import com.madarsa.model.User;
import com.madarsa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createDefaultUsers();
    }

    private void createDefaultUsers() {
        // Admin User
        createOrUpdateUser("admin@madarsa.com", "Admin@123", "Administrator", "9304678815", "ADMIN");

        // Teacher User
        createOrUpdateUser("teacher@madarsa.com", "Teacher@123", "Demo Teacher", "9876543210", "TEACHER");

        // Student User
        createOrUpdateUser("student@madarsa.com", "Student@123", "Demo Student", "9876543211", "STUDENT");

        log.info("========================================");
        log.info("🔐 Default Login Credentials:");
        log.info("----------------------------------------");
        log.info("👨‍💼 Admin:   admin@madarsa.com / Admin@123");
        log.info("👨‍🏫 Teacher: teacher@madarsa.com / Teacher@123");
        log.info("👨‍🎓 Student: student@madarsa.com / Student@123");
        log.info("========================================");
    }

    private void createOrUpdateUser(String email, String password, String name, String mobile, String userType) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setMobile(mobile);
            user.setPassword(passwordEncoder.encode(password));
            user.setUserType(userType);
            user.setIsVerified(true);
            user.setIsApproved(true);
            user.setApprovalStatus("APPROVED");
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            userRepository.save(user);
            log.info("✅ {} user created: {}", userType, email);
        } else {
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setPassword(passwordEncoder.encode(password));
                user.setIsVerified(true);
                user.setIsApproved(true);
                user.setApprovalStatus("APPROVED");
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
                log.info("✅ {} user updated: {}", userType, email);
            });
        }
    }
}

