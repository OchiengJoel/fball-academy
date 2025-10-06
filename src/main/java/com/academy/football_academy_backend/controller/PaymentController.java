package com.academy.football_academy_backend.controller;

import com.academy.football_academy_backend.model.Payment;
import com.academy.football_academy_backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Payment> recordPayment(@RequestBody Payment payment, @RequestParam(required = false) Long invoiceId) {
        return ResponseEntity.ok(paymentService.recordPayment(payment, invoiceId));
    }

    @GetMapping("/kid/{kidId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('PARENT')")
    public ResponseEntity<Page<Payment>> getPaymentsForKid(
            @PathVariable Long kidId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Pageable pageable) {
        return ResponseEntity.ok(paymentService.getPaymentsForKid(kidId, start, end, pageable));
    }
}


