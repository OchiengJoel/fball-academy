package com.academy.football_academy_backend.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "fee_schedules")
public class FeeSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feeScheduleId;

    @Column(nullable = false)
    private String description; // e.g., "Monthly Training Fee", "Registration Fee"

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeeType type; // ONE_OFF or RECURRING

    @Enumerated(EnumType.STRING)
    @Column
    private RecurrenceInterval recurrenceInterval; // DAILY, WEEKLY, MONTHLY, ANNUALLY (null for ONE_OFF)

    @Column
    private LocalDate startDate; // For RECURRING fees

    @Column
    private LocalDate endDate; // For RECURRING fees

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum FeeType {
        ONE_OFF, RECURRING
    }

    public enum RecurrenceInterval {
        DAILY, WEEKLY, MONTHLY, ANNUALLY
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
