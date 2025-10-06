package com.academy.football_academy_backend.controller;

import com.academy.football_academy_backend.dto.*;
import com.academy.football_academy_backend.model.PasswordResetToken;
import com.academy.football_academy_backend.model.User;
import com.academy.football_academy_backend.repository.PasswordResetTokenRepository;
import com.academy.football_academy_backend.security.JwtUtil;
import com.academy.football_academy_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final PasswordResetTokenRepository tokenRepository;

    @PostMapping("/verify-login-token")
    public ResponseEntity<?> verifyLoginToken(@RequestParam String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token has expired");
        }
        User user = resetToken.getUser();
        String jwt = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());

        // Create an immutable map
        Map<String, Object> response = Collections.unmodifiableMap(new HashMap<String, Object>() {{
            put("jwt", jwt);
            put("userId", user.getUserId());
            put("email", user.getEmail());
        }});
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            User user = userService.findByEmail(request.getEmail());
            String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
            return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (jwtUtil.validateToken(refreshToken)) {
            String email = jwtUtil.getEmailFromToken(refreshToken);
            User user = userService.findByEmail(email);
            String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
            return ResponseEntity.ok(new AuthResponse(newAccessToken, refreshToken));
        } else {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<Void> requestPasswordReset(@RequestBody PasswordResetRequest request) {
        userService.createPasswordResetToken(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password-reset")
    public ResponseEntity<Void> resetPassword(@RequestBody PasswordResetConfirmRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
