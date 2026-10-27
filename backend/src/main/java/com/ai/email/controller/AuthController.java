package com.ai.email.controller;

import com.ai.email.dto.AuthResponse;
import com.ai.email.dto.LoginRequest;
import com.ai.email.dto.RegisterRequest;
import com.ai.email.dto.UserSummaryDto;
import com.ai.email.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        log.info("Registration attempt for email: '{}', contact: '{}'", request.getEmail(), request.getContactNumber());
        try {
            UserSummaryDto user = userService.register(request);
            return ResponseEntity.ok(AuthResponse.success("Account created successfully! Welcome to SmartMail AI.", user));
        } catch (IllegalArgumentException e) {
            log.warn("Registration rejected: {}", e.getMessage());
            return ResponseEntity.badRequest().body(AuthResponse.failure(e.getMessage()));
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(AuthResponse.failure("An unexpected error occurred during registration."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        log.info("Login attempt for identifier: '{}'", request.getIdentifier());
        try {
            UserSummaryDto user = userService.login(request);
            return ResponseEntity.ok(AuthResponse.success("Welcome back, " + user.getFullName() + "!", user));
        } catch (IllegalArgumentException e) {
            log.warn("Login failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(AuthResponse.failure(e.getMessage()));
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(AuthResponse.failure("An unexpected error occurred during login."));
        }
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<AuthResponse> getUserProfile(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(AuthResponse.success("Profile fetched", user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
