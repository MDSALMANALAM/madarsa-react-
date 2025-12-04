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
@Table(name = "donations")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "donor_name", length = 100)
    private String donorName;

    @Column(name = "donor_email", length = 100)
    private String donorEmail;

    @Column(name = "donor_phone", length = 20)
    private String donorPhone;

    @Column(name = "amount", precision = 10, scale = 2)
    private Double amount;

    @Column(name = "type", length = 50)
    private String donationType;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "status", length = 20)
    private String status = "PENDING";

    @Column(name = "notes", length = 1000)
    private String notes;

    // Razorpay fields
    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 255)
    private String razorpaySignature;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PaymentMethod {
        CASH, ONLINE, RAZORPAY, BANK_TRANSFER, UPI
    }

    public enum DonationStatus {
        PENDING, COMPLETED, FAILED, CANCELLED
    }

    public DonationStatus getStatusEnum() {
        if (status == null) return DonationStatus.PENDING;
        try {
            return DonationStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            return DonationStatus.PENDING;
        }
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

