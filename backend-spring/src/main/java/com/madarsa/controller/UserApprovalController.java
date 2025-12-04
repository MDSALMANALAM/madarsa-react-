package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import com.madarsa.model.User;
import com.madarsa.repository.UserRepository;
import com.madarsa.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/approval")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserApprovalController {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<User>>> getPendingUsers() {
        List<User> pendingUsers = userRepository.findByApprovalStatus("PENDING");
        return ResponseEntity.ok(ApiResponse.success("Pending users fetched", pendingUsers));
    }

    @GetMapping("/pending/{userType}")
    public ResponseEntity<ApiResponse<List<User>>> getPendingUsersByType(@PathVariable String userType) {
        List<User> pendingUsers = userRepository.findByUserTypeAndApprovalStatus(userType.toUpperCase(), "PENDING");
        return ResponseEntity.ok(ApiResponse.success("Pending users fetched", pendingUsers));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<User>> approveUser(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                user.setIsApproved(true);
                user.setApprovalStatus("APPROVED");
                user.setApprovedAt(LocalDateTime.now());
                User updated = userRepository.save(user);

                // Send approval email
                emailService.sendApprovalEmail(user.getEmail(), user.getName(), true, null);

                return ResponseEntity.ok(ApiResponse.success("User approved", updated));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("User not found")));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<User>> rejectUser(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        return userRepository.findById(id)
            .map(user -> {
                String reason = body != null ? body.get("reason") : null;

                user.setIsApproved(false);
                user.setApprovalStatus("REJECTED");
                user.setRejectionReason(reason);
                User updated = userRepository.save(user);

                // Send rejection email
                emailService.sendApprovalEmail(user.getEmail(), user.getName(), false, reason);

                return ResponseEntity.ok(ApiResponse.success("User rejected", updated));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("User not found")));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getApprovalStats() {
        long pending = userRepository.countByApprovalStatus("PENDING");
        long approved = userRepository.countByApprovalStatus("APPROVED");
        long rejected = userRepository.countByApprovalStatus("REJECTED");

        long pendingStudents = userRepository.countByUserTypeAndApprovalStatus("STUDENT", "PENDING");
        long pendingTeachers = userRepository.countByUserTypeAndApprovalStatus("TEACHER", "PENDING");
        long pendingParents = userRepository.countByUserTypeAndApprovalStatus("PARENT", "PENDING");

        Map<String, Object> stats = Map.of(
            "pending", pending,
            "approved", approved,
            "rejected", rejected,
            "pendingStudents", pendingStudents,
            "pendingTeachers", pendingTeachers,
            "pendingParents", pendingParents
        );

        return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
    }
}

