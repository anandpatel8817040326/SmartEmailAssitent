package com.ai.email.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

public class PasswordUtil {

    private static final SecureRandom RANDOM = new SecureRandom();

    public static String hashPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Password cannot be empty.");
        }
        byte[] salt = new byte[16];
        RANDOM.nextBytes(salt);
        String saltHex = HexFormat.of().formatHex(salt);
        String hashHex = computeHash(rawPassword, salt);
        return saltHex + ":" + hashHex;
    }

    public static boolean verifyPassword(String rawPassword, String storedHash) {
        if (rawPassword == null || storedHash == null || !storedHash.contains(":")) {
            return false;
        }
        String[] parts = storedHash.split(":", 2);
        if (parts.length != 2) {
            return false;
        }
        String saltHex = parts[0];
        String expectedHashHex = parts[1];
        byte[] salt = HexFormat.of().parseHex(saltHex);
        String actualHashHex = computeHash(rawPassword, salt);
        return MessageDigest.isEqual(
                expectedHashHex.getBytes(StandardCharsets.UTF_8),
                actualHashHex.getBytes(StandardCharsets.UTF_8)
        );
    }

    private static String computeHash(String password, byte[] salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(salt);
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
