package com.academy.util;

import com.academy.model.Statement;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class PdfGenerator {
    public String generateStatementPdf(Statement statement) {
        String dirPath = "/tmp/statements";
        File dir = new File(dirPath);
        if (!dir.exists()) {
            dir.mkdirs(); // Create directory if it doesn't exist
        }
        String filePath = dirPath + "/statement_" + statement.getStatementId() + ".pdf";
        try {
            PdfWriter writer = new PdfWriter(filePath);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            document.add(new Paragraph("Statement for Kid ID: " + statement.getKid().getKidId()));
            document.add(new Paragraph("Period: " + statement.getPeriodStart() + " to " + statement.getPeriodEnd()));
            document.add(new Paragraph("Total Due: $" + statement.getTotalDue()));
            document.add(new Paragraph("Total Paid: $" + statement.getTotalPaid()));
            document.add(new Paragraph("Status: " + statement.getStatus()));
            document.close();
            return filePath;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
