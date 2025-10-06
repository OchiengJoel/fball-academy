package com.academy.football_academy_backend.repository;

import com.academy.football_academy_backend.model.Progress;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    Page<Progress> findByKidKidIdAndDateBetween(Long kidId, LocalDate start, LocalDate end, Pageable pageable);
    List<Progress> findByKidKidIdAndDateBetween(Long kidId, LocalDate start, LocalDate end);
}
