package com.ai.email.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private UserSummaryDto user;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message, UserSummaryDto user) {
        this.success = success;
        this.message = message;
        this.user = user;
    }

    public static AuthResponse success(String message, UserSummaryDto user) {
        return new AuthResponse(true, message, user);
    }

    public static AuthResponse failure(String message) {
        return new AuthResponse(false, message, null);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserSummaryDto getUser() {
        return user;
    }

    public void setUser(UserSummaryDto user) {
        this.user = user;
    }
}
