package com.academy.football_academy_backend.controller;

import com.academy.football_academy_backend.model.User;
import com.academy.football_academy_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

//    @PostMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
//    public ResponseEntity<User> createUser(@RequestBody User user, @RequestParam(defaultValue = "true") Boolean sendCredentials) {
//        return ResponseEntity.ok(userService.createUser(user, sendCredentials != null ? sendCredentials : true));
//    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody User user, @RequestParam(defaultValue = "true") Boolean sendCredentials) {
        return ResponseEntity.ok(userService.createUser(user, sendCredentials, null)); // Pass null for customPassword
    }

    @GetMapping("/{email}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.email == #email")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email cannot be empty");
        }
        try {
            User user = userService.findByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found: " + email);
        }
    }
}
