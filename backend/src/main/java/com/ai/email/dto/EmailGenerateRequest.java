package com.ai.email.dto;

public class EmailGenerateRequest {
    private String prompt;
    private String tone; // PROFESSIONAL, CASUAL, FRIENDLY, URGENT
    private String recipient;
    private String subject;

    public EmailGenerateRequest() {}

    public EmailGenerateRequest(String prompt, String tone, String recipient, String subject) {
        this.prompt = prompt;
        this.tone = tone;
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
}
