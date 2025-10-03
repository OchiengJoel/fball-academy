package com.academy.service;

import com.academy.model.*;
import com.academy.repository.*;
import com.academy.util.PdfGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StatementService {
    private final StatementRepository statementRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final KidRepository kidRepository;
    private final PdfGenerator pdfGenerator;
    private final PaymentRepository paymentRepository;

    public Statement generateStatement(Long kidId, LocalDate periodStart, LocalDate periodEnd) {
        Kid kid = kidRepository.findById(kidId)
                .orElseThrow(() -> new RuntimeException("Kid not found"));
        Statement statement = new Statement();
        statement.setKid(kid);
        statement.setPeriodStart(periodStart);
        statement.setPeriodEnd(periodEnd);
        statement.setTotalDue(calculateTotalDue(kidId, periodStart, periodEnd));
        statement.setTotalPaid(calculateTotalPaid(kidId, periodStart, periodEnd));
        statement.setStatus(statement.getTotalDue() <= statement.getTotalPaid() ? Statement.Status.CLOSED : Statement.Status.OPEN);
        statement.setPdfUrl(pdfGenerator.generateStatementPdf(statement));
        return statementRepository.save(statement);
    }

    private Double calculateTotalDue(Long kidId, LocalDate periodStart, LocalDate periodEnd) {
        return feeInvoiceRepository.findByKidKidIdAndDueDateBetween(kidId, periodStart, periodEnd)
                .stream()
                .mapToDouble(FeeInvoice::getAmount)
                .sum();
    }

    private Double calculateTotalPaid(Long kidId, LocalDate periodStart, LocalDate periodEnd) {
        return feeInvoiceRepository.findByKidKidIdAndDueDateBetween(kidId, periodStart, periodEnd)
                .stream()
                .flatMap(invoice -> paymentRepository.findByFeeInvoiceInvoiceId(invoice.getInvoiceId()).stream())
                .filter(p -> p.getStatus() == Payment.Status.COMPLETED)
                .mapToDouble(Payment::getAmount)
                .sum();
    }
}
