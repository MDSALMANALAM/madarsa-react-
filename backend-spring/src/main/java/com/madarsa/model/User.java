package com.madarsa.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String name;

    @Column(unique = true, length = 100)
    private String email;

    @Column(unique = true, length = 15)
    private String mobile;

    @Column(length = 255)
    private String password;

    @Column(name = "userType", length = 50)
    private String userType;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Transient fields for approval system (will be added to DB via JPA auto-update)
    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "is_approved")
    private Boolean isApproved = false;

    @Column(name = "approval_status", length = 20)
    private String approvalStatus = "PENDING";

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods for UserType
    public UserType getUserTypeEnum() {
        if (userType == null) return null;
        try {
            return UserType.valueOf(userType.toUpperCase());
        } catch (Exception e) {
            return UserType.GENERAL;
        }
    }

    public void setUserTypeEnum(UserType type) {
        this.userType = type != null ? type.name() : null;
    }

    public ApprovalStatus getApprovalStatusEnum() {
        if (approvalStatus == null) return ApprovalStatus.PENDING;
        try {
            return ApprovalStatus.valueOf(approvalStatus.toUpperCase());
        } catch (Exception e) {
            return ApprovalStatus.PENDING;
        }
    }

    public void setApprovalStatusEnum(ApprovalStatus status) {
        this.approvalStatus = status != null ? status.name() : "PENDING";
    }

    public enum UserType {
        STUDENT, TEACHER, PARENT, ADMIN, GENERAL
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }

    @PrePersist
    public void preSave() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();

        // Auto approve general and admin users
        if ("GENERAL".equalsIgnoreCase(this.userType) || "ADMIN".equalsIgnoreCase(this.userType)) {
            this.isApproved = true;
            this.approvalStatus = "APPROVED";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

