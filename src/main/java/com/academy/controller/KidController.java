package com.academy.controller;

import com.academy.dto.KidRequest;
import com.academy.model.Kid;
import com.academy.service.KidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kids")
@RequiredArgsConstructor
public class KidController {
    private final KidService kidService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Kid> addKid(@RequestBody KidRequest kidRequest) {
        return ResponseEntity.ok(kidService.addKid(kidRequest));
    }

    @GetMapping("/parent/{parentId}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.userId == #parentId")
    public ResponseEntity<List<Kid>> getKidsByParent(@PathVariable Long parentId) {
        return ResponseEntity.ok(kidService.getKidsByParent(parentId));
    }

    @PutMapping("/{kidId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Kid> updateKid(@PathVariable Long kidId, @RequestBody KidRequest kidRequest) {
        // Implement update logic if needed
        throw new UnsupportedOperationException("Update not implemented");
    }

    @DeleteMapping("/{kidId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteKid(@PathVariable Long kidId) {
        // Implement delete logic if needed
        throw new UnsupportedOperationException("Delete not implemented");
    }
}
