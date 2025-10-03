package com.academy.service;

import com.academy.model.FeeSchedule;
import com.academy.repository.FeeScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeeScheduleService {
    private final FeeScheduleRepository feeScheduleRepository;

    public FeeSchedule createFeeSchedule(FeeSchedule feeSchedule) {
        return feeScheduleRepository.save(feeSchedule);
    }

    public List<FeeSchedule> getActiveFeeSchedules(LocalDate date) {
        return feeScheduleRepository.findByTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                FeeSchedule.FeeType.RECURRING, date, date);
    }

    // Create default fee schedules if none exist
    public void ensureDefaultFeeSchedules() {
        LocalDate today = LocalDate.now();
        List<FeeSchedule> existing = feeScheduleRepository.findAll();
        if (existing.isEmpty()) {
            FeeSchedule registrationFee = new FeeSchedule();
            registrationFee.setDescription("Registration Fee");
            registrationFee.setAmount(50.0);
            registrationFee.setType(FeeSchedule.FeeType.ONE_OFF);
            feeScheduleRepository.save(registrationFee);

            FeeSchedule monthlyTrainingFee = new FeeSchedule();
            monthlyTrainingFee.setDescription("Monthly Training Fee");
            monthlyTrainingFee.setAmount(100.0);
            monthlyTrainingFee.setType(FeeSchedule.FeeType.RECURRING);
            monthlyTrainingFee.setRecurrenceInterval(FeeSchedule.RecurrenceInterval.MONTHLY);
            monthlyTrainingFee.setStartDate(today.minusYears(1));
            monthlyTrainingFee.setEndDate(today.plusYears(1));
            feeScheduleRepository.save(monthlyTrainingFee);
        }
    }
}
