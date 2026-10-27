package com.ai.email.dto;

public class EmailSendResponse {
    private boolean success;
    private String message;
    private Long draftId;
    private String status;

    public EmailSendResponse() {}

    public EmailSendResponse(boolean success, String message, Long draftId, String status) {
        this.success = success;
        this.message = message;
        this.draftId = draftId;
        this.status = status;
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

    public Long getDraftId() {
        return draftId;
    }

    public void setDraftId(Long draftId) {
        this.draftId = draftId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
