package com.academy.football_academy_backend.controller;

import com.academy.football_academy_backend.model.Statement;
import com.academy.football_academy_backend.service.StatementService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/statements")
@RequiredArgsConstructor
public class StatementController {
    private final StatementService statementService;

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Statement> generateStatement(
            @RequestParam Long kidId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd,
            @RequestParam(defaultValue = "false") boolean includeDetails) {
        return ResponseEntity.ok(statementService.generateStatement(kidId, periodStart, periodEnd, includeDetails));
    }

    @GetMapping("/export/{kidId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<byte[]> exportStatement(
            @PathVariable Long kidId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd,
            @RequestParam(defaultValue = "false") boolean includeDetails,
            @RequestParam String format) {
        byte[] data = statementService.exportStatement(kidId, periodStart, periodEnd, includeDetails, format);
        String contentType = format.equals("pdf") ? MediaType.APPLICATION_PDF_VALUE : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        String filename = "statement_" + kidId + "." + (format.equals("pdf") ? "pdf" : "xlsx");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(data);
    }

    @GetMapping("/profile-summary/{kidId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('PARENT')")
    public ResponseEntity<byte[]> exportProfileSummary(
            @PathVariable Long kidId,
            @RequestParam String format) {
        byte[] data = statementService.exportProfileSummary(kidId, format);
        String contentType = format.equals("pdf") ? MediaType.APPLICATION_PDF_VALUE : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        String filename = "profile_summary_" + kidId + "." + (format.equals("pdf") ? "pdf" : "xlsx");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(data);
    }
}
