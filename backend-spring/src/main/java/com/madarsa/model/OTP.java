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
@Table(name = "otps")
public class OTP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "otp", length = 10)
    private String otp;

    @Column(name = "purpose", length = 50)
    private String purpose = "registration";

    @Column(name = "is_used")
    private Boolean used = false;

    public Boolean isUsed() {
        return used != null && used;
    }

    public void setUsed(Boolean used) {
        this.used = used;
    }

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private int attempts = 0;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}

