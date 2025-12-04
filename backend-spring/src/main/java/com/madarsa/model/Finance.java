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
@Table(name = "finance_transactions")
public class Finance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Transient fields for compatibility
    @Transient
    private String paymentMethod;

    @Transient
    private String referenceNo;

    @Transient
    private String createdBy;

    public enum TransactionType {
        INCOME, EXPENSE, income, expense
    }

    public TransactionType getTypeEnum() {
        if (type == null) return TransactionType.EXPENSE;
        try {
            return TransactionType.valueOf(type.toUpperCase());
        } catch (Exception e) {
            return TransactionType.EXPENSE;
        }
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}

