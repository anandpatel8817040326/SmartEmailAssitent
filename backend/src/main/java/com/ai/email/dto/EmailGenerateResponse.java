package com.ai.email.dto;

public class EmailGenerateResponse {
    private Long draftId;
    private String subject;
    private String generatedContent;
    private String tone;
    private String recipient;

    public EmailGenerateResponse() {}

    public EmailGenerateResponse(Long draftId, String subject, String generatedContent, String tone, String recipient) {
        this.draftId = draftId;
        this.subject = subject;
        this.generatedContent = generatedContent;
        this.tone = tone;
        this.recipient = recipient;
    }

    public Long getDraftId() {
        return draftId;
    }

    public void setDraftId(Long draftId) {
        this.draftId = draftId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
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

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }
}
