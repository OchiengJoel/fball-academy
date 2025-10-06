package com.academy.football_academy_backend.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "statement_entries")
public class StatementEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long entryId;

    @ManyToOne
    @JoinColumn(name = "statement_id", nullable = false)
    private Statement statement;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntryType type;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Double balance;

    public enum EntryType {
        INVOICE, PAYMENT
    }
}
