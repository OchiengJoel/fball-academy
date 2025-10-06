package com.academy.football_academy_backend.model;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "code_sequences")
public class CodeSequence {
    @Id
    private String prefix; // e.g., "FA-2025"

    @Column(nullable = false)
    private Long nextNumber; // e.g., 1, 2, 3, ...
}