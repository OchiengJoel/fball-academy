package com.academy.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "progress")
public class Progress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long progressId;

    @ManyToOne
    @JoinColumn(name = "kid_id", nullable = false)
    private Kid kid;

    @Column(nullable = false)
    private LocalDate date;

    @Column
    private Integer goalsScored;

    @Column
    private Integer assists;

    @Column
    private String coachNotes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
