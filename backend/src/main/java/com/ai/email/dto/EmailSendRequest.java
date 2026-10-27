package com.ai.email.dto;

public class EmailSendRequest {
    private Long draftId;
    private String recipient;
    private String subject;
    private String body;
    private String tone;

    public EmailSendRequest() {}

    public EmailSendRequest(Long draftId, String recipient, String subject, String body, String tone) {
        this.draftId = draftId;
        this.recipient = recipient;
        this.subject = subject;
        this.body = body;
        this.tone = tone;
    }

    public Long getDraftId() {
        return draftId;
    }

    public void setDraftId(Long draftId) {
        this.draftId = draftId;
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

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }
}
