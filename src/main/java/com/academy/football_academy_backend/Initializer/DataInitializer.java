package com.academy.football_academy_backend.Initializer;


import com.academy.football_academy_backend.dto.KidRequest;
import com.academy.football_academy_backend.model.*;
import com.academy.football_academy_backend.repository.KidRepository;
import com.academy.football_academy_backend.repository.StatementRepository;
import com.academy.football_academy_backend.service.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final FeeScheduleService feeScheduleService;
    private final UserService userService;
    private final KidService kidService;
    private final FeeInvoiceService feeInvoiceService;
    private final PaymentService paymentService;
    private final ProgressService progressService;
    private final StatementService statementService;
    private final KidRepository kidRepository;
    private final StatementRepository statementRepository;

    @Value("${admin.email:johnny@academy.com}")
    private String adminEmail;

    @Value("${admin.phone:+254123456789}")
    private String adminPhone;

    @Value("${admin.password:Admin123*}")
    private String adminPassword;

    @Value("${initializer.send-credentials:false}")
    private boolean sendCredentials;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting data initialization...");
        initializeFeeSchedules();
        initializeAdminUser();
        initializeSampleUsers();
        initializeSampleKids();
        initializeSampleInvoices();
        initializeSamplePayments();
        initializeSampleProgress();
        initializeSampleStatements();
        log.info("Data initialization completed.");
    }

    private void initializeFeeSchedules() {
        log.info("Initializing fee schedules...");
        List<FeeSchedule> existing = feeScheduleService.getActiveFeeSchedules(LocalDate.now());
        if (existing.isEmpty()) {
            FeeSchedule registrationFee = new FeeSchedule();
            registrationFee.setDescription("Registration Fee");
            registrationFee.setAmount(50.0);
            registrationFee.setType(FeeSchedule.FeeType.ONE_OFF);
            feeScheduleService.createFeeSchedule(registrationFee);
            log.info("Created fee schedule: {}", registrationFee.getDescription());

            FeeSchedule monthlyTrainingFee = new FeeSchedule();
            monthlyTrainingFee.setDescription("Monthly Training Fee");
            monthlyTrainingFee.setAmount(100.0);
            monthlyTrainingFee.setType(FeeSchedule.FeeType.RECURRING);
            monthlyTrainingFee.setRecurrenceInterval(FeeSchedule.RecurrenceInterval.MONTHLY);
            monthlyTrainingFee.setStartDate(LocalDate.now().minusYears(1));
            monthlyTrainingFee.setEndDate(LocalDate.now().plusYears(1));
            feeScheduleService.createFeeSchedule(monthlyTrainingFee);
            log.info("Created fee schedule: {}", monthlyTrainingFee.getDescription());

            FeeSchedule kitFee = new FeeSchedule();
            kitFee.setDescription("Uniform Kit Fee");
            kitFee.setAmount(30.0);
            kitFee.setType(FeeSchedule.FeeType.ONE_OFF);
            feeScheduleService.createFeeSchedule(kitFee);
            log.info("Created fee schedule: {}", kitFee.getDescription());
        } else {
            log.info("Fee schedules already exist, skipping creation.");
        }
    }

//    private void initializeAdminUser() {
//        try {
//            Optional<User> existingUser = userService.findByEmailOptional(adminEmail);
//            if (existingUser.isPresent()) {
//                log.info("Admin user with email {} already exists, skipping creation", adminEmail);
//                return;
//            }
//            existingUser = userService.findByPhoneNumberOptional(adminPhone);
//            if (existingUser.isPresent()) {
//                log.info("Admin user with phone {} already exists, skipping creation", adminPhone);
//                return;
//            }
//
//            User admin = new User();
//            admin.setFirstName("Johnny");
//            admin.setLastName("Admin");
//            admin.setEmail(adminEmail);
//            admin.setPhoneNumber(adminPhone);
//            admin.setRole(User.Role.SUPER_ADMIN);
//            // Do not set passwordHash directly; let createUser handle it
//            userService.createUser(admin, sendCredentials);
//            log.info("Successfully created SUPER_ADMIN user: {}", adminEmail);
//        } catch (Exception e) {
//            log.error("Failed to create SUPER_ADMIN user: {}", e.getMessage());
//        }
//    }

    private void initializeAdminUser() {
        try {
            Optional<User> existingUser = userService.findByEmailOptional(adminEmail);
            if (existingUser.isPresent()) {
                log.info("Admin user with email {} already exists, skipping creation", adminEmail);
                return;
            }
            existingUser = userService.findByPhoneNumberOptional(adminPhone);
            if (existingUser.isPresent()) {
                log.info("Admin user with phone {} already exists, skipping creation", adminPhone);
                return;
            }

            User admin = new User();
            admin.setFirstName("Johnny");
            admin.setLastName("Admin");
            admin.setEmail(adminEmail);
            admin.setPhoneNumber(adminPhone);
            admin.setRole(User.Role.SUPER_ADMIN);
            userService.createUser(admin, sendCredentials, adminPassword);
            log.info("Successfully created SUPER_ADMIN user: {}", adminEmail);
        } catch (Exception e) {
            log.error("Failed to create SUPER_ADMIN user: {}", e.getMessage());
        }
    }

//    private void initializeSampleUsers() {
//        log.info("Initializing sample users...");
//        try {
//            Optional<User> existingParent = userService.findByEmailOptional("parent1@academy.com");
//            if (!existingParent.isPresent()) {
//                User parent = new User();
//                parent.setFirstName("Jane");
//                parent.setLastName("Doe");
//                parent.setEmail("parent1@academy.com");
//                parent.setPhoneNumber("+254987654321");
//                parent.setPasswordHash("Parent123*");
//                parent.setRole(User.Role.PARENT);
//                userService.createUser(parent, sendCredentials);
//                log.info("Created sample parent user: {}", parent.getEmail());
//            }
//
//            Optional<User> existingAdmin = userService.findByEmailOptional("staff@academy.com");
//            if (!existingAdmin.isPresent()) {
//                User admin = new User();
//                admin.setFirstName("Alice");
//                admin.setLastName("Staff");
//                admin.setEmail("staff@academy.com");
//                admin.setPhoneNumber("+254123987654");
//                admin.setPasswordHash("Staff123*");
//                admin.setRole(User.Role.ADMIN);
//                userService.createUser(admin, sendCredentials);
//                log.info("Created sample admin user: {}", admin.getEmail());
//            }
//        } catch (Exception e) {
//            log.error("Failed to create sample users: {}", e.getMessage());
//        }
//    }

    private void initializeSampleUsers() {
        log.info("Initializing sample users...");
        try {
            Optional<User> existingParent = userService.findByEmailOptional("parent1@academy.com");
            if (!existingParent.isPresent()) {
                User parent = new User();
                parent.setFirstName("Jane");
                parent.setLastName("Doe");
                parent.setEmail("parent1@academy.com");
                parent.setPhoneNumber("+254987654321");
                parent.setRole(User.Role.PARENT);
                userService.createUser(parent, sendCredentials, "Parent123*"); // Pass password
                log.info("Created sample parent user: {}", parent.getEmail());
            }

            Optional<User> existingAdmin = userService.findByEmailOptional("staff@academy.com");
            if (!existingAdmin.isPresent()) {
                User admin = new User();
                admin.setFirstName("Alice");
                admin.setLastName("Staff");
                admin.setEmail("staff@academy.com");
                admin.setPhoneNumber("+254123987654");
                admin.setRole(User.Role.ADMIN);
                userService.createUser(admin, sendCredentials, "Staff123*"); // Pass password
                log.info("Created sample admin user: {}", admin.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to create sample users: {}", e.getMessage());
        }
    }

    private void initializeSampleKids() {
        log.info("Initializing sample kids...");
        try {
            Optional<User> parent = userService.findByEmailOptional("parent1@academy.com");
            if (!parent.isPresent()) {
                log.warn("Parent user not found, skipping kid initialization");
                return;
            }

            List<Kid> existingKids = kidService.getKidsByParent(parent.get().getUserId());
            if (existingKids.isEmpty()) {
                KidRequest kidRequest = new KidRequest();
                kidRequest.setParentId(parent.get().getUserId());
                kidRequest.setFirstName("John");
                kidRequest.setLastName("Doe");
                kidRequest.setDateOfBirth(LocalDate.now().minusYears(10));

                List<FeeSchedule> feeSchedules = feeScheduleService.getActiveFeeSchedules(LocalDate.now());
                feeSchedules.addAll(feeScheduleService.getActiveFeeSchedules(LocalDate.now().plusYears(1)));
                kidRequest.setFeeScheduleIds(feeSchedules.stream()
                        .map(FeeSchedule::getFeeScheduleId)
                        .collect(Collectors.toList()));

                kidService.addKid(kidRequest);
                log.info("Created sample kid: {} {}", kidRequest.getFirstName(), kidRequest.getLastName());
            } else {
                log.info("Kids already exist for parent, skipping creation.");
            }
        } catch (Exception e) {
            log.error("Failed to create sample kids: {}", e.getMessage());
        }
    }

    private void initializeSampleInvoices() {
        log.info("Initializing sample invoices...");
        try {
            Optional<Kid> kid = kidRepository.findByCode("FA-2025-0001");
            if (!kid.isPresent()) {
                log.warn("Sample kid not found, skipping invoice initialization");
                return;
            }

            List<FeeInvoice> existingInvoices = feeInvoiceService.getInvoicesForKid(
                    kid.get().getKidId(), LocalDate.now().minusMonths(1), LocalDate.now().plusMonths(1));
            if (existingInvoices.isEmpty()) {
                List<FeeSchedule> feeSchedules = feeScheduleService.getActiveFeeSchedules(LocalDate.now());
                for (FeeSchedule schedule : feeSchedules) {
                    LocalDate dueDate = schedule.getType() == FeeSchedule.FeeType.ONE_OFF
                            ? LocalDate.now().plusDays(30)
                            : LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1);
                    feeInvoiceService.createInvoice(kid.get().getKidId(), schedule.getFeeScheduleId(), dueDate);
                    log.info("Created sample invoice for kid {} and fee schedule {}", kid.get().getKidId(), schedule.getDescription());
                }
            } else {
                log.info("Invoices already exist for sample kid, skipping creation.");
            }
        } catch (Exception e) {
            log.error("Failed to create sample invoices: {}", e.getMessage());
        }
    }

    private void initializeSamplePayments() {
        log.info("Initializing sample payments...");
        try {
            Optional<Kid> kid = kidRepository.findByCode("FA-2025-0001");
            if (!kid.isPresent()) {
                log.warn("Sample kid not found, skipping payment initialization");
                return;
            }

            List<FeeInvoice> invoices = feeInvoiceService.getInvoicesForKid(
                    kid.get().getKidId(), LocalDate.now().minusMonths(1), LocalDate.now().plusMonths(1));
            if (!invoices.isEmpty()) {
                FeeInvoice invoice = invoices.get(0);
                Payment payment = new Payment();
                payment.setKid(kid.get());
                payment.setFeeInvoice(invoice);
                payment.setAmount(invoice.getAmount());
                payment.setPaymentMethod(Payment.PaymentMethod.CASH);
                payment.setTransactionId("TXN-" + UUID.randomUUID().toString());
                paymentService.recordPayment(payment, invoice.getInvoiceId());
                log.info("Created sample payment for invoice {}", invoice.getInvoiceId());
            }
        } catch (Exception e) {
            log.error("Failed to create sample payments: {}", e.getMessage());
        }
    }

    private void initializeSampleProgress() {
        log.info("Initializing sample progress records...");
        try {
            Optional<Kid> kid = kidRepository.findByCode("FA-2025-0001");
            if (!kid.isPresent()) {
                log.warn("Sample kid not found, skipping progress initialization");
                return;
            }

            List<Progress> existingProgress = progressService.getProgressForKid(
                    kid.get().getKidId(), LocalDate.now().minusMonths(1), LocalDate.now());
            if (existingProgress.isEmpty()) {
                Progress progress = new Progress();
                progress.setKid(kid.get());
                progress.setDate(LocalDate.now());
                progress.setCoachNotes("Completed first training session");
                progress.setAssists(10);
                progress.setGoalsScored(25);
                progressService.addProgress(progress);
                log.info("Created sample progress for kid {}", kid.get().getKidId());
            } else {
                log.info("Progress records already exist for sample kid, skipping creation.");
            }
        } catch (Exception e) {
            log.error("Failed to create sample progress records: {}", e.getMessage());
        }
    }

    private void initializeSampleStatements() {
        log.info("Initializing sample statements...");
        try {
            Optional<Kid> kid = kidRepository.findByCode("FA-2025-0001");
            if (!kid.isPresent()) {
                log.warn("Sample kid not found, skipping statement initialization");
                return;
            }

            LocalDate periodStart = LocalDate.now().withDayOfMonth(1);
            LocalDate periodEnd = periodStart.plusMonths(1).minusDays(1);
            List<Statement> existingStatements = statementRepository.findByKidKidIdAndPeriodStartAndPeriodEnd(
                    kid.get().getKidId(), periodStart, periodEnd);
            if (existingStatements.isEmpty()) {
                Statement statement = statementService.generateStatement(kid.get().getKidId(), periodStart, periodEnd, true);
                log.info("Created sample statement for kid {} for period {} to {}",
                        kid.get().getKidId(), periodStart, periodEnd);
            } else {
                log.info("Statements already exist for sample kid, skipping creation.");
            }
        } catch (Exception e) {
            log.error("Failed to create sample statements: {}", e.getMessage());
        }
    }

    private boolean isValidPassword(String password) {
        String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password != null && password.matches(passwordPattern);
    }
}


