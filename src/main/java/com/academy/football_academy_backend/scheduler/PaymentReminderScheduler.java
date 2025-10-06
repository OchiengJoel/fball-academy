package com.academy.football_academy_backend.scheduler;

import com.academy.football_academy_backend.model.FeeInvoice;
import com.academy.football_academy_backend.model.Notification;
import com.academy.football_academy_backend.repository.FeeInvoiceRepository;
import com.academy.football_academy_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PaymentReminderScheduler {
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 9 * * ?") // Run daily at 9 AM
    public void sendPaymentReminders() {
        LocalDate today = LocalDate.now();
        List<FeeInvoice> overdueInvoices = feeInvoiceRepository.findByStatusAndDueDateLessThan(
                FeeInvoice.InvoiceStatus.OPEN, today);
        for (FeeInvoice invoice : overdueInvoices) {
            Notification notification = new Notification();
            notification.setUser(invoice.getKid().getParent());
            notification.setType(Notification.Type.PAYMENT_REMINDER);
            notification.setMessage(String.format("Overdue invoice #%d for %s %s: $%.2f due by %s",
                    invoice.getInvoiceId(), invoice.getKid().getFirstName(), invoice.getKid().getLastName(),
                    invoice.getAmount(), invoice.getDueDate()));
            notification.setChannel(Notification.Channel.SMS);
            notificationService.sendNotification(notification);
        }
    }
}
