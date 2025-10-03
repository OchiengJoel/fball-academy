package com.academy.repository;

import com.academy.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserUserIdAndStatus(Long userId, Notification.Status status);
}
