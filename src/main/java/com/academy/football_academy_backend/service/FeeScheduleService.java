package com.academy.football_academy_backend.service;

import com.academy.football_academy_backend.model.FeeSchedule;
import com.academy.football_academy_backend.repository.FeeScheduleRepository;
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

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeeScheduleService {
    private final FeeScheduleRepository feeScheduleRepository;

    public FeeSchedule createFeeSchedule(FeeSchedule feeSchedule) {
        return feeScheduleRepository.save(feeSchedule);
    }

    public List<FeeSchedule> getActiveFeeSchedules(LocalDate date) {
        return feeScheduleRepository.findByTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                FeeSchedule.FeeType.RECURRING, date, date);
    }

    // Create default fee schedules if none exist
    public void ensureDefaultFeeSchedules() {
        LocalDate today = LocalDate.now();
        List<FeeSchedule> existing = feeScheduleRepository.findAll();
        if (existing.isEmpty()) {
            FeeSchedule registrationFee = new FeeSchedule();
            registrationFee.setDescription("Registration Fee");
            registrationFee.setAmount(50.0);
            registrationFee.setType(FeeSchedule.FeeType.ONE_OFF);
            feeScheduleRepository.save(registrationFee);

            FeeSchedule monthlyTrainingFee = new FeeSchedule();
            monthlyTrainingFee.setDescription("Monthly Training Fee");
            monthlyTrainingFee.setAmount(100.0);
            monthlyTrainingFee.setType(FeeSchedule.FeeType.RECURRING);
            monthlyTrainingFee.setRecurrenceInterval(FeeSchedule.RecurrenceInterval.MONTHLY);
            monthlyTrainingFee.setStartDate(today.minusYears(1));
            monthlyTrainingFee.setEndDate(today.plusYears(1));
            feeScheduleRepository.save(monthlyTrainingFee);
        }
    }

    public byte[] exportFeeSchedules(Long kidId, String format) {
        List<FeeSchedule> feeSchedules = getActiveFeeSchedules(LocalDate.now());
        if (format.equals("pdf")) {
            return generateFeeSchedulesPdf(feeSchedules, kidId);
        } else if (format.equals("excel")) {
            return generateFeeSchedulesExcel(feeSchedules, kidId);
        }
        throw new IllegalArgumentException("Unsupported format: " + format);
    }

    private byte[] generateFeeSchedulesPdf(List<FeeSchedule> feeSchedules, Long kidId) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("Fee Schedules for Kid ID: " + kidId));
            Table table = new Table(new float[]{150, 100, 100, 100, 100, 100});
            table.addHeaderCell("Description");
            table.addHeaderCell("Amount");
            table.addHeaderCell("Type");
            table.addHeaderCell("Recurrence");
            table.addHeaderCell("Start Date");
            table.addHeaderCell("End Date");

            for (FeeSchedule schedule : feeSchedules) {
                table.addCell(schedule.getDescription());
                table.addCell(String.format("$%.2f", schedule.getAmount()));
                table.addCell(schedule.getType().toString());
                table.addCell(schedule.getRecurrenceInterval() != null ? schedule.getRecurrenceInterval().toString() : "-");
                table.addCell(schedule.getStartDate() != null ? schedule.getStartDate().toString() : "-");
                table.addCell(schedule.getEndDate() != null ? schedule.getEndDate().toString() : "-");
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private byte[] generateFeeSchedulesExcel(List<FeeSchedule> feeSchedules, Long kidId) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Fee Schedules");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Description");
            header.createCell(1).setCellValue("Amount");
            header.createCell(2).setCellValue("Type");
            header.createCell(3).setCellValue("Recurrence");
            header.createCell(4).setCellValue("Start Date");
            header.createCell(5).setCellValue("End Date");

            int rowNum = 1;
            for (FeeSchedule schedule : feeSchedules) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(schedule.getDescription());
                row.createCell(1).setCellValue(schedule.getAmount());
                row.createCell(2).setCellValue(schedule.getType().toString());
                row.createCell(3).setCellValue(schedule.getRecurrenceInterval() != null ? schedule.getRecurrenceInterval().toString() : "-");
                row.createCell(4).setCellValue(schedule.getStartDate() != null ? schedule.getStartDate().toString() : "-");
                row.createCell(5).setCellValue(schedule.getEndDate() != null ? schedule.getEndDate().toString() : "-");
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }
    }

}
