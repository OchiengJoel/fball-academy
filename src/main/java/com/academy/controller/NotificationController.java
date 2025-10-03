package com.academy.controller;

import com.academy.dto.BulkNotificationRequest;
import com.academy.model.Notification;
import com.academy.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> sendNotification(@RequestBody Notification notification) {
        notificationService.sendNotification(notification);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> sendBulkNotification(
            @RequestBody BulkNotificationRequest request) {
        notificationService.sendBulkSms(request.getUserIds(), request.getMessage());
        return ResponseEntity.ok().build();
    }
}
