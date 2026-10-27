package com.ai.email.dto;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String contactNumber;
    private String password;

    public RegisterRequest() {}

    public RegisterRequest(String fullName, String email, String contactNumber, String password) {
        this.fullName = fullName;
        this.email = email;
        this.contactNumber = contactNumber;
        this.password = password;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
