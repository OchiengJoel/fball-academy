package com.academy.controller;

import com.academy.model.Payment;
import com.academy.service.PaymentService;
import lombok.RequiredArgsConstructor;
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payment> recordPayment(@RequestBody Payment payment, @RequestParam(required = false) Long invoiceId) {
        return ResponseEntity.ok(paymentService.recordPayment(payment, invoiceId));
    }

    @GetMapping("/kid/{kidId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<List<Payment>> getPaymentsForKid(
            @PathVariable Long kidId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(paymentService.getPaymentsForKid(kidId, start, end));
    }
}


