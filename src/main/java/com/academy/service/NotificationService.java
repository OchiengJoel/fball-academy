package com.academy.service;

import com.academy.model.Notification;
import com.academy.model.User;
import com.academy.repository.NotificationRepository;
import com.academy.repository.UserRepository;
import com.academy.util.SmsClient;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SmsClient smsClient;
    private final JavaMailSender mailSender;

    public void sendNotification(Notification notification) {
        notification.setStatus(Notification.Status.PENDING);
        notificationRepository.save(notification);

        if (notification.getChannel() == Notification.Channel.SMS) {
            boolean sent = smsClient.sendSms(notification.getUser().getPhoneNumber(), notification.getMessage());
            notification.setStatus(sent ? Notification.Status.SENT : Notification.Status.FAILED);
        } else if (notification.getChannel() == Notification.Channel.EMAIL) {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setTo(notification.getUser().getEmail());
                mail.setSubject(notification.getType().name());
                mail.setText(notification.getMessage());
                mailSender.send(mail);
                notification.setStatus(Notification.Status.SENT);
            } catch (Exception e) {
                notification.setStatus(Notification.Status.FAILED);
            }
        }
        notification.setSentAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public void sendBulkSms(List<Long> userIds, String message) {
        List<User> users = userRepository.findAllById(userIds);
        users.forEach(user -> {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(Notification.Type.ANNOUNCEMENT);
            notification.setMessage(message);
            notification.setChannel(Notification.Channel.SMS);
            notification.setStatus(Notification.Status.PENDING);
            notificationRepository.save(notification);

            boolean sent = smsClient.sendSms(user.getPhoneNumber(), message);
            notification.setStatus(sent ? Notification.Status.SENT : Notification.Status.FAILED);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }

}