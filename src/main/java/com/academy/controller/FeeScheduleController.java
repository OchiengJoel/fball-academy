package com.academy.controller;

import com.academy.model.FeeSchedule;
import com.academy.service.FeeScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeeSchedule>> getActiveFeeSchedules(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(feeScheduleService.getActiveFeeSchedules(date));
    }
}