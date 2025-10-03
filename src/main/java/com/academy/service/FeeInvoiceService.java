package com.academy.service;

import com.academy.model.FeeInvoice;
import com.academy.model.FeeSchedule;
import com.academy.model.Kid;
import com.academy.repository.FeeInvoiceRepository;
import com.academy.repository.FeeScheduleRepository;
import com.academy.repository.KidRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeeInvoiceService {
    private static final Logger log = LoggerFactory.getLogger(FeeInvoiceService.class);
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final KidRepository kidRepository;
    private final FeeScheduleRepository feeScheduleRepository;

    public FeeInvoice createInvoice(Long kidId, Long feeScheduleId, LocalDate dueDate) {
        log.info("Creating invoice for kidId: {}, feeScheduleId: {}, dueDate: {}", kidId, feeScheduleId, dueDate);

        Kid kid = kidRepository.findById(kidId)
                .orElseThrow(() -> {
                    log.error("Kid not found: {}", kidId);
                    return new IllegalArgumentException("Kid not found");
                });
        FeeSchedule feeSchedule = feeScheduleRepository.findById(feeScheduleId)
                .orElseThrow(() -> {
                    log.error("Fee schedule not found: {}", feeScheduleId);
                    return new IllegalArgumentException("Fee schedule not found");
                });

        // Check for duplicate invoice (same kid, fee schedule, and period)
        if (isDuplicateInvoice(kid, feeSchedule, dueDate)) {
            log.error("Duplicate invoice detected for kidId: {}, feeScheduleId: {}, period: {}", kidId, feeScheduleId, dueDate);
            throw new IllegalArgumentException("An invoice for this kid, fee schedule, and period already exists");
        }

        FeeInvoice invoice = new FeeInvoice();
        invoice.setKid(kid);
        invoice.setFeeSchedule(feeSchedule);
        invoice.setAmount(feeSchedule.getAmount());
        invoice.setDueDate(dueDate);
        invoice.setStatus(FeeInvoice.InvoiceStatus.OPEN);
        return feeInvoiceRepository.save(invoice);
    }

    public List<FeeInvoice> getInvoicesForKid(Long kidId, LocalDate start, LocalDate end) {
        return feeInvoiceRepository.findByKidKidIdAndDueDateBetween(kidId, start, end);
    }

    public Double getOutstandingBalance(Long kidId, LocalDate start, LocalDate end) {
        return feeInvoiceRepository.findByKidKidIdAndDueDateBetween(kidId, start, end)
                .stream()
                .filter(invoice -> invoice.getStatus() != FeeInvoice.InvoiceStatus.PAID)
                .mapToDouble(FeeInvoice::getAmount)
                .sum();
    }

    private boolean isDuplicateInvoice(Kid kid, FeeSchedule feeSchedule, LocalDate dueDate) {
        if (feeSchedule.getType() == FeeSchedule.FeeType.ONE_OFF) {
            // For one-off fees, check if an invoice exists for the same kid and fee schedule
            return feeInvoiceRepository.findByKidKidIdAndFeeScheduleFeeScheduleId(kid.getKidId(), feeSchedule.getFeeScheduleId())
                    .stream()
                    .anyMatch(invoice -> invoice.getStatus() != FeeInvoice.InvoiceStatus.PAID);
        } else {
            // For recurring fees, check if an invoice exists for the same period (e.g., same month)
            LocalDate periodStart = dueDate.withDayOfMonth(1);
            LocalDate periodEnd = dueDate.withDayOfMonth(dueDate.lengthOfMonth());
            return feeInvoiceRepository.findByKidKidIdAndFeeScheduleFeeScheduleIdAndDueDateBetween(
                            kid.getKidId(), feeSchedule.getFeeScheduleId(), periodStart, periodEnd)
                    .stream()
                    .anyMatch(invoice -> invoice.getStatus() != FeeInvoice.InvoiceStatus.PAID);
        }
    }
}
