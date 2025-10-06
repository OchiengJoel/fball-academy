package com.academy.football_academy_backend.service;

import com.academy.football_academy_backend.model.FeeInvoice;
import com.academy.football_academy_backend.model.Payment;
import com.academy.football_academy_backend.repository.FeeInvoiceRepository;
import com.academy.football_academy_backend.repository.KidRepository;
import com.academy.football_academy_backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final KidRepository kidRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;

    public Payment recordPayment(Payment payment, Long invoiceId) {
        if (!kidRepository.existsById(payment.getKid().getKidId())) {
            throw new RuntimeException("Kid not found");
        }
        FeeInvoice invoice = null;
        if (invoiceId != null) {
            invoice = feeInvoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));
            payment.setFeeInvoice(invoice);
        }
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(Payment.Status.COMPLETED);
        Payment savedPayment = paymentRepository.save(payment);
        if (invoice != null) {
            updateInvoiceStatus(invoice);
        }
        return savedPayment;
    }

    public Page<Payment> getPaymentsForKid(Long kidId, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return paymentRepository.findByKidKidIdAndPaymentDateBetween(kidId, start, end, pageable);
    }

    private void updateInvoiceStatus(FeeInvoice invoice) {
        List<Payment> payments = paymentRepository.findByFeeInvoiceInvoiceId(invoice.getInvoiceId());
        double paidAmount = payments.stream()
                .filter(p -> p.getStatus() == Payment.Status.COMPLETED)
                .mapToDouble(Payment::getAmount)
                .sum();
        invoice.setStatus(paidAmount >= invoice.getAmount() ? FeeInvoice.InvoiceStatus.PAID : FeeInvoice.InvoiceStatus.OPEN);
        feeInvoiceRepository.save(invoice);
    }
}
