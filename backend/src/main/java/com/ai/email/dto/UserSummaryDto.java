package com.ai.email.dto;

import com.ai.email.model.User;
import java.time.LocalDateTime;

public class UserSummaryDto {
    private Long id;
    private String fullName;
    private String email;
    private String contactNumber;
    private LocalDateTime createdAt;

    public UserSummaryDto() {}

    public UserSummaryDto(Long id, String fullName, String email, String contactNumber, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.contactNumber = contactNumber;
        this.createdAt = createdAt;
    }

    public static UserSummaryDto fromEntity(User user) {
        if (user == null) return null;
        return new UserSummaryDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getContactNumber(),
                user.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
