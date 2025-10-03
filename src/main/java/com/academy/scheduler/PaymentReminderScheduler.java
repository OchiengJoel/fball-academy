package com.academy.scheduler;

import com.academy.model.FeeInvoice;
import com.academy.model.Notification;
import com.academy.model.Statement;
import com.academy.model.User;
import com.academy.repository.FeeInvoiceRepository;
import com.academy.repository.StatementRepository;
import com.academy.service.NotificationService;
import com.academy.service.StatementService;
import com.academy.service.UserService;
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
