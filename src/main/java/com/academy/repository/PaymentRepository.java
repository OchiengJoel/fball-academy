package com.academy.repository;

import com.academy.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByKidKidIdAndPaymentDateBetween(Long kidId, LocalDateTime start, LocalDateTime end);
    List<Payment> findByStatus(Payment.Status status);
    List<Payment> findByFeeInvoiceInvoiceId(Long invoiceId);
}
