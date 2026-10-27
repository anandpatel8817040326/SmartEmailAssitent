package com.ai.email.service;

import com.ai.email.dto.LoginRequest;
import com.ai.email.dto.RegisterRequest;
import com.ai.email.dto.UserSummaryDto;
import com.ai.email.model.User;
import com.ai.email.repository.UserRepository;
import com.ai.email.util.PasswordUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserSummaryDto register(RegisterRequest request) {
        if (request.getFullName() == null || request.getFullName().trim().isBlank()) {
            throw new IllegalArgumentException("Full Name is required.");
        }

        if (request.getEmail() == null || request.getEmail().trim().isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Please provide a valid email address.");
        }

        if (request.getContactNumber() == null || request.getContactNumber().trim().isBlank()) {
            throw new IllegalArgumentException("Contact number is required.");
        }

        String contact = cleanContactNumber(request.getContactNumber());
        if (contact.length() < 7 || contact.length() > 18) {
            throw new IllegalArgumentException("Contact number must be between 7 and 18 digits.");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        if (userRepository.existsByContactNumber(contact)) {
            throw new IllegalArgumentException("An account with this contact number already exists.");
        }

        String passwordHash = PasswordUtil.hashPassword(request.getPassword());
        User user = new User(request.getFullName().trim(), email, contact, passwordHash);
        user = userRepository.save(user);

        log.info("New user registered successfully: {} ({}, {})", user.getFullName(), user.getEmail(), user.getContactNumber());
        return UserSummaryDto.fromEntity(user);
    }

    public UserSummaryDto login(LoginRequest request) {
        if (request.getIdentifier() == null || request.getIdentifier().trim().isBlank()) {
            throw new IllegalArgumentException("Please provide your email address or contact number.");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }

        String identifier = request.getIdentifier().trim();
        Optional<User> userOpt;

        if (identifier.contains("@")) {
            userOpt = userRepository.findByEmailIgnoreCase(identifier.toLowerCase());
        } else {
            String cleanedContact = cleanContactNumber(identifier);
            userOpt = userRepository.findByContactNumber(cleanedContact);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByContactNumber(identifier);
            }
        }

        if (userOpt.isEmpty()) {
            log.warn("Login failed: User not found for identifier '{}'", identifier);
            throw new IllegalArgumentException("Invalid email/contact number or password.");
        }

        User user = userOpt.get();
        if (!PasswordUtil.verifyPassword(request.getPassword(), user.getPasswordHash())) {
            log.warn("Login failed: Password mismatch for user id {}", user.getId());
            throw new IllegalArgumentException("Invalid email/contact number or password.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("User logged in successfully: {} (id: {})", user.getFullName(), user.getId());
        return UserSummaryDto.fromEntity(user);
    }

    public Optional<UserSummaryDto> getUserById(Long id) {
        return userRepository.findById(id).map(UserSummaryDto::fromEntity);
    }

    private String cleanContactNumber(String raw) {
        if (raw == null) return "";
        // Keep digits and leading + if present
        String trimmed = raw.trim();
        boolean hasPlus = trimmed.startsWith("+");
        String digitsOnly = trimmed.replaceAll("[^0-9]", "");
        return hasPlus ? "+" + digitsOnly : digitsOnly;
    }
}
