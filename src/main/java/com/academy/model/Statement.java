package com.academy.model;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "statements")
public class Statement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long statementId;

    @ManyToOne
    @JoinColumn(name = "kid_id", nullable = false)
    private Kid kid;

    @Column(nullable = false)
    private LocalDate periodStart;

    @Column(nullable = false)
    private LocalDate periodEnd;

    @Column(nullable = false)
    private Double totalDue;

    @Column(nullable = false)
    private Double totalPaid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private LocalDateTime generatedAt;

    @Column
    private String pdfUrl;

    public enum Status {
        OPEN, CLOSED
    }

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}


