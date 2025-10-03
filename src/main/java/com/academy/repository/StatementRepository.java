package com.academy.repository;

import com.academy.model.Statement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface StatementRepository extends JpaRepository<Statement, Long> {
    List<Statement> findByKidKidIdAndPeriodStartGreaterThanEqualAndPeriodEndLessThanEqual(Long kidId, LocalDate start, LocalDate end);
    List<Statement> findByStatusAndPeriodEndLessThan(Statement.Status status, LocalDate date);
}
