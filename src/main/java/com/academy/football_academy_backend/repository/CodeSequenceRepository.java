package com.academy.football_academy_backend.repository;

import com.academy.football_academy_backend.model.CodeSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CodeSequenceRepository extends JpaRepository<CodeSequence, String> {
    @Modifying
    @Query("UPDATE CodeSequence cs SET cs.nextNumber = cs.nextNumber + 1 WHERE cs.prefix = :prefix")
    int incrementNextNumber(String prefix);
}