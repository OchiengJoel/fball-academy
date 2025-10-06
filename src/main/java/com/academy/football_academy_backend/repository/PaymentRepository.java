package com.academy.football_academy_backend.repository;

import com.academy.football_academy_backend.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findByKidKidIdAndPaymentDateBetween(Long kidId, LocalDateTime start, LocalDateTime end, Pageable pageable);
    List<Payment> findByKidKidIdAndPaymentDateBetween(Long kidId, LocalDateTime start, LocalDateTime end);
    List<Payment> findByStatus(Payment.Status status);
    List<Payment> findByFeeInvoiceInvoiceId(Long invoiceId);
}
