package com.ai.email.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_drafts")
public class EmailDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(length = 255)
    private String sender;

    @Column(length = 255)
    private String recipient;

    @Column(length = 500)
    private String subject;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String generatedContent;

    @Column(length = 50)
    private String tone; // PROFESSIONAL, CASUAL, FRIENDLY, URGENT

    @Column(length = 50)
    private String status; // DRAFT, SENT, FAILED

    @Column(length = 1000)
    private String statusMessage;

    private LocalDateTime createdAt;
    private LocalDateTime sentAt;

    public EmailDraft() {
        this.createdAt = LocalDateTime.now();
        this.status = "DRAFT";
    }

    public EmailDraft(String recipient, String subject, String prompt, String generatedContent, String tone) {
        this.recipient = recipient;
        this.subject = subject;
        this.prompt = prompt;
        this.generatedContent = generatedContent;
        this.tone = tone;
        this.status = "DRAFT";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getGeneratedContent() {
        return generatedContent;
    }

    public void setGeneratedContent(String generatedContent) {
        this.generatedContent = generatedContent;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
