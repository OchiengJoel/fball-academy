package com.academy.football_academy_backend.controller;

import com.academy.football_academy_backend.model.FeeSchedule;
import com.academy.football_academy_backend.service.FeeScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fee-schedules")
@RequiredArgsConstructor
public class FeeScheduleController {
    private final FeeScheduleService feeScheduleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeSchedule> createFeeSchedule(@RequestBody FeeSchedule feeSchedule) {
        return ResponseEntity.ok(feeScheduleService.createFeeSchedule(feeSchedule));
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<FeeSchedule>> getActiveFeeSchedules(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(feeScheduleService.getActiveFeeSchedules(date));
    }

    @GetMapping("/export/{kidId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<byte[]> exportFeeSchedules(
            @PathVariable Long kidId,
            @RequestParam String format) {
        byte[] data = feeScheduleService.exportFeeSchedules(kidId, format);
        String contentType = format.equals("pdf") ? MediaType.APPLICATION_PDF_VALUE : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        String filename = "fee_schedules_" + kidId + "." + (format.equals("pdf") ? "pdf" : "xlsx");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(data);
    }
}