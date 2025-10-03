package com.academy.Initializer;


import com.academy.model.User;
import com.academy.service.FeeScheduleService;
import com.academy.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final FeeScheduleService feeScheduleService;
    private final UserService userService;

    @Value("${admin.email:johnny@academy.com}")
    private String adminEmail;

    @Value("${admin.phone:+254123456789}")
    private String adminPhone;

    @Value("${admin.password:Admin123*}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        feeScheduleService.ensureDefaultFeeSchedules();
        initializeAdminUser();
    }

    private void initializeAdminUser() {
        try {
            // Check for duplicate email or phone
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

            // Validate password
            if (!isValidPassword(adminPassword)) {
                log.error("Admin password does not meet security requirements");
                return;
            }

            // Create admin user
            User admin = new User();
            admin.setFirstName("Johnny");
            admin.setLastName("Admin");
            admin.setEmail(adminEmail);
            admin.setPhoneNumber(adminPhone);
            admin.setPasswordHash(adminPassword); // Will be encoded by UserService
            admin.setRole(User.Role.SUPER_ADMIN);

            userService.createUser(admin);
            log.info("Successfully created SUPER_ADMIN user: {}", adminEmail);
        } catch (Exception e) {
            log.error("Failed to create SUPER_ADMIN user: {}", e.getMessage());
        }
    }

    private boolean isValidPassword(String password) {
        // Password policy: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password != null && password.matches(passwordPattern);
    }
}


