package com.academy.football_academy_backend.service;

import com.academy.football_academy_backend.model.*;
import com.academy.football_academy_backend.repository.FeeInvoiceRepository;
import com.academy.football_academy_backend.repository.KidRepository;
import com.academy.football_academy_backend.repository.PaymentRepository;
import com.academy.football_academy_backend.repository.StatementRepository;
import com.academy.football_academy_backend.util.PdfGenerator;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class StatementService {
    private final StatementRepository statementRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final KidRepository kidRepository;
    private final PaymentRepository paymentRepository;
    private final PdfGenerator pdfGenerator;

    @Transactional
    public Statement generateStatement(Long kidId, LocalDate periodStart, LocalDate periodEnd, boolean includeDetails) {
        Kid kid = kidRepository.findById(kidId)
                .orElseThrow(() -> new RuntimeException("Kid not found"));

        Statement statement = new Statement();
        statement.setKid(kid);
        statement.setPeriodStart(periodStart);
        statement.setPeriodEnd(periodEnd);
        statement.setTotalDue(calculateTotalDue(kidId, periodStart, periodEnd));
        statement.setTotalPaid(calculateTotalPaid(kidId, periodStart, periodEnd));
        statement.setStatus(statement.getTotalDue() <= statement.getTotalPaid() ? Statement.Status.CLOSED : Statement.Status.OPEN);

        if (includeDetails) {
            List<StatementEntry> entries = generateStatementEntries(kidId, periodStart, periodEnd);
            statement.setEntries(entries);
        }

        statement.setPdfUrl(pdfGenerator.generateStatementPdf(statement));
        return statementRepository.save(statement);
    }

    public byte[] exportStatement(Long kidId, LocalDate periodStart, LocalDate periodEnd, boolean includeDetails, String format) {
        Statement statement = generateStatement(kidId, periodStart, periodEnd, includeDetails);
        if (format.equals("pdf")) {
            return generateStatementPdf(statement);
        } else if (format.equals("excel")) {
            return generateStatementExcel(statement);
        }
        throw new IllegalArgumentException("Unsupported format: " + format);
    }

    public byte[] exportProfileSummary(Long kidId, String format) {
        Kid kid = kidRepository.findById(kidId)
                .orElseThrow(() -> new RuntimeException("Kid not found"));
        if (format.equals("pdf")) {
            return generateProfileSummaryPdf(kid);
        } else if (format.equals("excel")) {
            return generateProfileSummaryExcel(kid);
        }
        throw new IllegalArgumentException("Unsupported format: " + format);
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

    private List<StatementEntry> generateStatementEntries(Long kidId, LocalDate periodStart, LocalDate periodEnd) {
        List<FeeInvoice> invoices = feeInvoiceRepository.findByKidKidIdAndDueDateBetween(kidId, periodStart, periodEnd);
        List<Payment> payments = paymentRepository.findByKidKidIdAndPaymentDateBetween(
                kidId, periodStart.atStartOfDay(), periodEnd.atStartOfDay().plusDays(1));

        List<StatementEntry> entries = new ArrayList<>();
        double runningBalance = 0.0;

        Stream<StatementEntry> invoiceEntries = invoices.stream().map(invoice -> {
            StatementEntry entry = new StatementEntry();
            entry.setDate(invoice.getDueDate());
            entry.setType(StatementEntry.EntryType.INVOICE);
            entry.setAmount(invoice.getAmount());
            return entry;
        });

        Stream<StatementEntry> paymentEntries = payments.stream()
                .filter(p -> p.getStatus() == Payment.Status.COMPLETED)
                .map(payment -> {
                    StatementEntry entry = new StatementEntry();
                    entry.setDate(payment.getPaymentDate().toLocalDate());
                    entry.setType(StatementEntry.EntryType.PAYMENT);
                    entry.setAmount(-payment.getAmount());
                    return entry;
                });

        entries = Stream.concat(invoiceEntries, paymentEntries)
                .sorted(Comparator.comparing(StatementEntry::getDate))
                .collect(Collectors.toList());

        for (StatementEntry entry : entries) {
            runningBalance += entry.getAmount();
            entry.setBalance(runningBalance);
        }

        return entries;
    }

    private byte[] generateStatementPdf(Statement statement) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("Statement for " + statement.getKid().getFirstName() + " " + statement.getKid().getLastName()));
            document.add(new Paragraph("Period: " + statement.getPeriodStart() + " to " + statement.getPeriodEnd()));
            document.add(new Paragraph("Total Due: $" + statement.getTotalDue()));
            document.add(new Paragraph("Total Paid: $" + statement.getTotalPaid()));
            document.add(new Paragraph("Status: " + statement.getStatus()));

            if (statement.getEntries() != null && !statement.getEntries().isEmpty()) {
                document.add(new Paragraph("Statement Entries").setBold());
                Table table = new Table(new float[]{100, 100, 100, 100});
                table.addHeaderCell("Date");
                table.addHeaderCell("Type");
                table.addHeaderCell("Amount");
                table.addHeaderCell("Balance");

                for (StatementEntry entry : statement.getEntries()) {
                    table.addCell(entry.getDate().toString());
                    table.addCell(entry.getType().toString());
                    table.addCell(String.format("$%.2f", entry.getAmount()));
                    table.addCell(String.format("$%.2f", entry.getBalance()));
                }
                document.add(table);
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private byte[] generateStatementExcel(Statement statement) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Statement");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Statement ID");
            header.createCell(1).setCellValue("Kid");
            header.createCell(2).setCellValue("Period Start");
            header.createCell(3).setCellValue("Period End");
            header.createCell(4).setCellValue("Total Due");
            header.createCell(5).setCellValue("Total Paid");
            header.createCell(6).setCellValue("Status");

            Row row = sheet.createRow(1);
            row.createCell(0).setCellValue(statement.getStatementId());
            row.createCell(1).setCellValue(statement.getKid().getFirstName() + " " + statement.getKid().getLastName());
            row.createCell(2).setCellValue(statement.getPeriodStart().toString());
            row.createCell(3).setCellValue(statement.getPeriodEnd().toString());
            row.createCell(4).setCellValue(statement.getTotalDue());
            row.createCell(5).setCellValue(statement.getTotalPaid());
            row.createCell(6).setCellValue(statement.getStatus().toString());

            if (statement.getEntries() != null && !statement.getEntries().isEmpty()) {
                Sheet entriesSheet = workbook.createSheet("Entries");
                Row entriesHeader = entriesSheet.createRow(0);
                entriesHeader.createCell(0).setCellValue("Date");
                entriesHeader.createCell(1).setCellValue("Type");
                entriesHeader.createCell(2).setCellValue("Amount");
                entriesHeader.createCell(3).setCellValue("Balance");

                int rowNum = 1;
                for (StatementEntry entry : statement.getEntries()) {
                    Row entryRow = entriesSheet.createRow(rowNum++);
                    entryRow.createCell(0).setCellValue(entry.getDate().toString());
                    entryRow.createCell(1).setCellValue(entry.getType().toString());
                    entryRow.createCell(2).setCellValue(entry.getAmount());
                    entryRow.createCell(3).setCellValue(entry.getBalance());
                }
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }
    }

    private byte[] generateProfileSummaryPdf(Kid kid) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("Profile Summary for " + kid.getFirstName() + " " + kid.getLastName()));
            document.add(new Paragraph("Code: " + kid.getCode()));
            document.add(new Paragraph("Date of Birth: " + kid.getDateOfBirth()));
            document.add(new Paragraph("Enrollment Date: " + kid.getEnrollmentDate()));
            document.add(new Paragraph("Status: " + kid.getStatus()));
            document.add(new Paragraph("Parent: " + (kid.getParent() != null ? kid.getParent().getFirstName() + " " + kid.getParent().getLastName() : "-")));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private byte[] generateProfileSummaryExcel(Kid kid) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Profile Summary");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Code");
            header.createCell(1).setCellValue("First Name");
            header.createCell(2).setCellValue("Last Name");
            header.createCell(3).setCellValue("Date of Birth");
            header.createCell(4).setCellValue("Enrollment Date");
            header.createCell(5).setCellValue("Status");
            header.createCell(6).setCellValue("Parent");

            Row row = sheet.createRow(1);
            row.createCell(0).setCellValue(kid.getCode());
            row.createCell(1).setCellValue(kid.getFirstName());
            row.createCell(2).setCellValue(kid.getLastName());
            row.createCell(3).setCellValue(kid.getDateOfBirth().toString());
            row.createCell(4).setCellValue(kid.getEnrollmentDate().toString());
            row.createCell(5).setCellValue(kid.getStatus().toString());
            row.createCell(6).setCellValue(kid.getParent() != null ? kid.getParent().getFirstName() + " " + kid.getParent().getLastName() : "-");

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }
    }
}
