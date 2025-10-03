package com.academy.service;

import com.academy.dto.KidRequest;
import com.academy.model.FeeInvoice;
import com.academy.model.FeeSchedule;
import com.academy.model.Kid;
import com.academy.model.User;
import com.academy.repository.FeeInvoiceRepository;
import com.academy.repository.FeeScheduleRepository;
import com.academy.repository.KidRepository;
import com.academy.repository.UserRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KidService {

    private final KidRepository kidRepository;
    private final UserRepository userRepository;
    private final FeeScheduleRepository feeScheduleRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;

    @Transactional
    public Kid addKid(KidRequest kidRequest) {
        User parent = userRepository.findById(kidRequest.getParentId())
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        Kid kid = new Kid();
        kid.setParent(parent);
        kid.setFirstName(kidRequest.getFirstName());
        kid.setLastName(kidRequest.getLastName());
        kid.setDateOfBirth(kidRequest.getDateOfBirth());
        kid.setEnrollmentDate(LocalDate.now());
        kid = kidRepository.save(kid); // Save to generate kidId for code

        // Assign one-off and recurring fee schedules
        assignFeeSchedules(kid, kidRequest.getFeeScheduleIds());

        return kid;
    }

    private void assignFeeSchedules(Kid kid, List<Long> feeScheduleIds) {
        LocalDate today = LocalDate.now();
        for (Long feeScheduleId : feeScheduleIds) {
            FeeSchedule feeSchedule = feeScheduleRepository.findById(feeScheduleId)
                    .orElseThrow(() -> new RuntimeException("Fee schedule not found"));

            FeeInvoice invoice = new FeeInvoice();
            invoice.setKid(kid);
            invoice.setFeeSchedule(feeSchedule);
            invoice.setAmount(feeSchedule.getAmount());
            invoice.setStatus(FeeInvoice.InvoiceStatus.OPEN);

            // Set due date based on fee type
            if (feeSchedule.getType() == FeeSchedule.FeeType.ONE_OFF) {
                invoice.setDueDate(today.plusDays(30)); // Due in 30 days for one-off
            } else if (feeSchedule.getType() == FeeSchedule.FeeType.RECURRING) {
                // For recurring, generate invoice for current period
                switch (feeSchedule.getRecurrenceInterval()) {
                    case MONTHLY:
                        invoice.setDueDate(today.withDayOfMonth(1).plusMonths(1).minusDays(1));
                        break;
                    case WEEKLY:
                        invoice.setDueDate(today.plusDays(7));
                        break;
                    case DAILY:
                        invoice.setDueDate(today.plusDays(1));
                        break;
                    case ANNUALLY:
                        invoice.setDueDate(today.withDayOfYear(1).plusYears(1).minusDays(1));
                        break;
                }
            }
            feeInvoiceRepository.save(invoice);
        }
    }

    public List<Kid> getKidsByParent(Long parentId) {
        return kidRepository.findByParentUserId(parentId);
    }
}
