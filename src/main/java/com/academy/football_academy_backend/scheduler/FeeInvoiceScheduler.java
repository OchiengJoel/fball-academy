package com.academy.football_academy_backend.scheduler;

import com.academy.football_academy_backend.model.FeeInvoice;
import com.academy.football_academy_backend.model.FeeSchedule;
import com.academy.football_academy_backend.model.Kid;
import com.academy.football_academy_backend.repository.FeeInvoiceRepository;
import com.academy.football_academy_backend.repository.FeeScheduleRepository;
import com.academy.football_academy_backend.repository.KidRepository;
import com.academy.football_academy_backend.service.FeeInvoiceService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class FeeInvoiceScheduler {
    private final FeeScheduleRepository feeScheduleRepository;
    private final KidRepository kidRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final FeeInvoiceService feeInvoiceService;

    private static final Logger log = LoggerFactory.getLogger(FeeInvoiceScheduler.class);

    @Scheduled(cron = "0 0 0 * * ?")
    public void generateInvoices() {
        LocalDate today = LocalDate.now();
        log.info("Starting invoice generation for {}", today);
        List<FeeSchedule> schedules = feeScheduleRepository.findByTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                FeeSchedule.FeeType.RECURRING, today, today);
        List<Kid> kids = kidRepository.findAll().stream()
                .filter(kid -> kid.getStatus() == Kid.Status.ACTIVE)
                .collect(Collectors.toList());

        for (Kid kid : kids) {
            for (FeeSchedule schedule : schedules) {
                if (!invoiceExists(kid, schedule, today)) {
                    LocalDate dueDate = calculateDueDate(schedule, today);
                    try {
                        feeInvoiceService.createInvoice(kid.getKidId(), schedule.getFeeScheduleId(), dueDate);
                        log.info("Generated invoice for kid {} (code: {}) for schedule {} (period: {})",
                                kid.getKidId(), kid.getCode(), schedule.getDescription(), today);
                    } catch (Exception e) {
                        log.error("Failed to generate invoice for kid {} and schedule {}: {}",
                                kid.getKidId(), schedule.getFeeScheduleId(), e.getMessage());
                    }
                }
            }
        }
        log.info("Completed invoice generation for {}", today);
    }

    private boolean invoiceExists(Kid kid, FeeSchedule schedule, LocalDate today) {
        LocalDate periodStart = calculatePeriodStart(schedule, today);
        LocalDate periodEnd = calculatePeriodEnd(schedule, today);
        List<FeeInvoice> existingInvoices = feeInvoiceRepository.findByKidKidIdAndDueDateBetween(
                kid.getKidId(), periodStart, periodEnd);
        return existingInvoices.stream()
                .anyMatch(invoice -> invoice.getFeeSchedule().getFeeScheduleId().equals(schedule.getFeeScheduleId()));
    }

    private LocalDate calculateDueDate(FeeSchedule schedule, LocalDate today) {
        switch (schedule.getRecurrenceInterval()) {
            case DAILY:
                return today.plusDays(1); // Due tomorrow
            case WEEKLY:
                return today.plusDays(7); // Due in one week
            case MONTHLY:
                return today.plusDays(30); // Due in one month
            case ANNUALLY:
                return today.plusYears(1); // Due in one year
            default:
                throw new IllegalArgumentException("Unknown recurrence interval: " + schedule.getRecurrenceInterval());
        }
    }

    private LocalDate calculatePeriodStart(FeeSchedule schedule, LocalDate today) {
        switch (schedule.getRecurrenceInterval()) {
            case DAILY:
                return today;
            case WEEKLY:
                return today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
            case MONTHLY:
                return today.withDayOfMonth(1);
            case ANNUALLY:
                return today.withDayOfYear(1);
            default:
                return today;
        }
    }

    private LocalDate calculatePeriodEnd(FeeSchedule schedule, LocalDate today) {
        switch (schedule.getRecurrenceInterval()) {
            case DAILY:
                return today;
            case WEEKLY:
                return today.with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));
            case MONTHLY:
                return today.withDayOfMonth(today.lengthOfMonth());
            case ANNUALLY:
                return today.withDayOfYear(today.lengthOfYear());
            default:
                return today;
        }
    }
}
