package com.ai.email.dto;

public class EmailGenerateRequest {
    private String prompt;
    private String tone; // PROFESSIONAL, CASUAL, FRIENDLY, URGENT
    private String sender;
    private String recipient;
    private String subject;
    private Long userId;

    public EmailGenerateRequest() {}

    public EmailGenerateRequest(String prompt, String tone, String recipient, String subject) {
        this.prompt = prompt;
        this.tone = tone;
        this.recipient = recipient;
        this.subject = subject;
    }

    public EmailGenerateRequest(String prompt, String tone, String sender, String recipient, String subject) {
        this.prompt = prompt;
        this.tone = tone;
        this.sender = sender;
        this.recipient = recipient;
        this.subject = subject;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
