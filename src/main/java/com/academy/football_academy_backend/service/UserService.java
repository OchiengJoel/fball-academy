package com.academy.football_academy_backend.service;

import com.academy.football_academy_backend.model.Notification;
import com.academy.football_academy_backend.model.PasswordResetToken;
import com.academy.football_academy_backend.model.User;
import com.academy.football_academy_backend.repository.PasswordResetTokenRepository;
import com.academy.football_academy_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final NotificationService notificationService; // Add NotificationService dependency

//    public User createUser(User user, boolean sendCredentials) {
//        // Validate email and phone number uniqueness
//        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
//            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
//        }
//        if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
//            throw new IllegalArgumentException("Phone number already exists: " + user.getPhoneNumber());
//        }
//
//        // Generate a temporary password if none provided
//        String rawPassword = user.getPasswordHash() != null ? user.getPasswordHash() : UUID.randomUUID().toString().substring(0, 12);
//        if (!isValidPassword(rawPassword)) {
//            throw new IllegalArgumentException("Generated password does not meet security requirements");
//        }
//        user.setPasswordHash(passwordEncoder.encode(rawPassword));
//        User savedUser = userRepository.save(user);
//
//        // Send credentials if requested
//        if (sendCredentials) {
//            sendCredentials(savedUser, rawPassword);
//        }
//
//        return savedUser;
//    }

    public User createUser(User user, boolean sendCredentials, String customPassword) {
        // Validate email and phone number uniqueness
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
            throw new IllegalArgumentException("Phone number already exists: " + user.getPhoneNumber());
        }

        // Use custom password if provided, otherwise generate a temporary one
        String rawPassword = customPassword != null ? customPassword : UUID.randomUUID().toString().substring(0, 12);
        if (!isValidPassword(rawPassword)) {
            throw new IllegalArgumentException("Password does not meet security requirements");
        }
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        User savedUser = userRepository.save(user);

        // Send credentials if requested
        if (sendCredentials) {
            sendCredentials(savedUser, rawPassword);
        }

        return savedUser;
    }

    // New overloaded method to support UserController
    public User createUser(User user) {
        return createUser(user, true, null); // Default: send credentials, no custom password
    }

    private void sendCredentials(User user, String rawPassword) {
        // Generate a one-time login link (optional, instead of sending raw password)
        String token = UUID.randomUUID().toString();
        PasswordResetToken loginToken = new PasswordResetToken();
        loginToken.setToken(token);
        loginToken.setUser(user);
        loginToken.setExpiryDate(LocalDateTime.now().plusHours(24)); // Valid for 24 hours
        tokenRepository.save(loginToken);

        // Send email
        sendCredentialsEmail(user.getEmail(), user.getFirstName(), token);

        // Send SMS via NotificationService
        String smsMessage = String.format("Welcome to Football Academy, %s! Log in at http://localhost:4200/login?token=%s to set your password. This link expires in 24 hours.",
                user.getFirstName(), token);
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(Notification.Type.ANNOUNCEMENT);
        notification.setMessage(smsMessage);
        notification.setChannel(Notification.Channel.SMS);
        try {
            notificationService.sendNotification(notification);
            log.info("Credentials SMS sent to {} for user {}", user.getPhoneNumber(), user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send credentials SMS to {}: {}", user.getPhoneNumber(), e.getMessage());
        }
    }

    private void sendCredentialsEmail(String email, String firstName, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("Welcome to Football Academy - Your Account Credentials");
            helper.setText(
                    String.format("Dear %s,\n\nYour account has been created.\n" +
                            "Please log in at http://localhost:4200/login?token=%s to set your password.\n" +
                            "This link will expire in 24 hours.", firstName, token), true);
            mailSender.send(message);
            log.info("Credentials email sent to {}", email);
        } catch (MessagingException e) {
            log.error("Failed to send credentials email to {}: {}", email, e.getMessage());
            // Do not throw exception to avoid failing user creation
        }
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Optional<User> findByEmailOptional(String email) {
        return userRepository.findByEmail(email);
    }

    public User findByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Optional<User> findByPhoneNumberOptional(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber);
    }

    public void createPasswordResetToken(String email) {
        User user = findByEmail(email);
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        tokenRepository.save(resetToken);

        // Send email
        sendResetEmail(user.getEmail(), token);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token has expired");
        }
        if (!isValidPassword(newPassword)) {
            throw new IllegalArgumentException("New password does not meet security requirements");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(resetToken);
    }

    private void sendResetEmail(String email, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("Password Reset Request");
            helper.setText(
                    "To reset your password, click the link below:\n" +
                            "http://localhost:4200/reset-password?token=" + token + "\n" +
                            "This link will expire in 24 hours.", true);
            mailSender.send(message);
            log.info("Password reset email sent to {}", email);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}: {}", email, e.getMessage());
            // Do not throw exception to avoid failing user creation
        }
    }

    private boolean isValidPassword(String password) {
        String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password != null && password.matches(passwordPattern);
    }
}
