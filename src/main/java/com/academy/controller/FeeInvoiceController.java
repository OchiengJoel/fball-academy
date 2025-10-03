package com.academy.controller;

import com.academy.model.FeeInvoice;
import com.academy.service.FeeInvoiceService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fee-invoices")
@RequiredArgsConstructor
public class FeeInvoiceController {
    private static final Logger log = LoggerFactory.getLogger(FeeInvoiceController.class);
    private final FeeInvoiceService feeInvoiceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<FeeInvoice> createInvoice(
            @RequestParam Long kidId,
            @RequestParam Long feeScheduleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate) {
        log.info("Creating invoice for kidId: {}, feeScheduleId: {}, dueDate: {}", kidId, feeScheduleId, dueDate);
        validateInvoiceRequest(kidId, feeScheduleId, dueDate);
        FeeInvoice invoice = feeInvoiceService.createInvoice(kidId, feeScheduleId, dueDate);
        log.info("Successfully created invoice with ID: {}", invoice.getInvoiceId());
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/kid/{kidId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('PARENT')")
    public ResponseEntity<List<FeeInvoice>> getInvoicesForKid(
            @PathVariable Long kidId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        log.info("Fetching invoices for kidId: {} from {} to {}", kidId, start, end);
        return ResponseEntity.ok(feeInvoiceService.getInvoicesForKid(kidId, start, end));
    }

    @GetMapping("/balance/{kidId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('PARENT')")
    public ResponseEntity<Double> getOutstandingBalance(
            @PathVariable Long kidId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        log.info("Fetching outstanding balance for kidId: {} from {} to {}", kidId, start, end);
        return ResponseEntity.ok(feeInvoiceService.getOutstandingBalance(kidId, start, end));
    }

    private void validateInvoiceRequest(Long kidId, Long feeScheduleId, LocalDate dueDate) {
        if (kidId == null || kidId <= 0) {
            log.error("Invalid kidId: {}", kidId);
            throw new IllegalArgumentException("Kid ID must be a positive number");
        }
        if (feeScheduleId == null || feeScheduleId <= 0) {
            log.error("Invalid feeScheduleId: {}", feeScheduleId);
            throw new IllegalArgumentException("Fee Schedule ID must be a positive number");
        }
        if (dueDate == null || dueDate.isBefore(LocalDate.now())) {
            log.error("Invalid dueDate: {}", dueDate);
            throw new IllegalArgumentException("Due date must be present and not in the past");
        }
    }
}
