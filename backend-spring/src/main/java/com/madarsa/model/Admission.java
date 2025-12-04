package com.madarsa.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "admissions")
public class Admission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admission_no", length = 50)
    private String admissionNo;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "father_name", length = 100)
    private String fatherName;

    @Column(name = "mother_name", length = 100)
    private String motherName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "class_name", length = 20)
    private String className;

    @Column(name = "parent_phone", length = 50)
    private String parentPhone;

    @Column(name = "parent_email", length = 100)
    private String parentEmail;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "city", length = 50)
    private String city;

    @Column(name = "state", length = 50)
    private String state;

    @Column(name = "pincode", length = 20)
    private String pincode;

    @Column(name = "country", length = 50)
    private String country = "India";

    @Column(name = "documents", columnDefinition = "JSON")
    private String documents;

    @Column(name = "status", length = 20)
    private String status = "pending";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AdmissionStatus {
        PENDING, APPROVED, REJECTED, pending, approved, rejected
    }

    public AdmissionStatus getStatusEnum() {
        if (status == null) return AdmissionStatus.PENDING;
        try {
            return AdmissionStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            return AdmissionStatus.PENDING;
        }
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "pending";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

