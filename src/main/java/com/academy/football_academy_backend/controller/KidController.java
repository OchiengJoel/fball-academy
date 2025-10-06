package com.academy.football_academy_backend.controller;

import com.academy.football_academy_backend.dto.KidRequest;

import com.academy.football_academy_backend.model.Kid;
import com.academy.football_academy_backend.service.KidService;
import lombok.Data;
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or authentication.principal.userId == #parentId")
    public ResponseEntity<List<Kid>> getKidsByParent(
            @PathVariable Long parentId,
            @RequestParam(required = false) Kid.Status status) {
        if (status != null) {
            return ResponseEntity.ok(kidService.getKidsByParentAndStatus(parentId, status));
        }
        return ResponseEntity.ok(kidService.getKidsByParent(parentId));
    }

    @PutMapping("/{kidId}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Kid> updateKidStatus(@PathVariable Long kidId, @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(kidService.updateKidStatus(kidId, request.getStatus()));
    }

    @PutMapping("/{kidId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Kid> updateKid(@PathVariable Long kidId, @RequestBody KidRequest kidRequest) {
        throw new UnsupportedOperationException("Update not implemented");
    }

    @DeleteMapping("/{kidId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteKid(@PathVariable Long kidId) {
        throw new UnsupportedOperationException("Delete not implemented");
    }
}

@Data
class StatusUpdateRequest {
    private Kid.Status status;
}
