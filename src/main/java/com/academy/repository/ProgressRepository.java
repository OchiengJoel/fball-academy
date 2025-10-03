package com.academy.repository;

import com.academy.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByKidKidIdAndDateBetween(Long kidId, LocalDate start, LocalDate end);
}
