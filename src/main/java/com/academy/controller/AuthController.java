package com.academy.controller;

import com.academy.dto.AuthResponse;
import com.academy.dto.PasswordResetConfirmRequest;
import com.academy.dto.PasswordResetRequest;
import com.academy.dto.RefreshTokenRequest;
import com.academy.model.LoginRequest;
import com.academy.model.User;
import com.academy.security.JwtUtil;
import com.academy.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userService.findByEmail(request.getEmail());
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken));
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
