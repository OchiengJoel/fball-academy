package com.academy.repository;

import com.academy.model.FeeInvoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FeeInvoiceRepository extends JpaRepository<FeeInvoice, Long> {
    List<FeeInvoice> findByKidKidIdAndDueDateBetween(Long kidId, LocalDate start, LocalDate end);
    List<FeeInvoice> findByStatusAndDueDateLessThan(FeeInvoice.InvoiceStatus status, LocalDate date);
    List<FeeInvoice> findByKidKidIdAndFeeScheduleFeeScheduleId(Long kidId, Long feeScheduleId);
    List<FeeInvoice> findByKidKidIdAndFeeScheduleFeeScheduleIdAndDueDateBetween(
            Long kidId, Long feeScheduleId, LocalDate start, LocalDate end);
}
