package com.academy.service;

import com.academy.model.PasswordResetToken;
import com.academy.model.User;
import com.academy.repository.PasswordResetTokenRepository;
import com.academy.repository.UserRepository;
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

    public User createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
            throw new IllegalArgumentException("Phone number already exists: " + user.getPhoneNumber());
        }
        if (!isValidPassword(user.getPasswordHash())) {
            throw new IllegalArgumentException("Password does not meet security requirements");
        }
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return userRepository.save(user);
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
        tokenRepository.delete(resetToken); // Invalidate token after use
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
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    private boolean isValidPassword(String password) {
        String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password != null && password.matches(passwordPattern);
    }
}
