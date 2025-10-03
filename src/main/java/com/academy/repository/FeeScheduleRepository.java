package com.academy.repository;

import com.academy.model.FeeSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FeeScheduleRepository extends JpaRepository<FeeSchedule, Long> {
    List<FeeSchedule> findByTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            FeeSchedule.FeeType type, LocalDate startDate, LocalDate endDate);
}
