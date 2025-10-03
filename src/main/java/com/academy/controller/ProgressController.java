package com.academy.controller;

import com.academy.model.Progress;
import com.academy.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {
    private final ProgressService progressService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Progress> addProgress(@RequestBody Progress progress) {
        return ResponseEntity.ok(progressService.addProgress(progress));
    }

    @GetMapping("/kid/{kidId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<List<Progress>> getProgressForKid(
            @PathVariable Long kidId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(progressService.getProgressForKid(kidId, start, end));
    }
}