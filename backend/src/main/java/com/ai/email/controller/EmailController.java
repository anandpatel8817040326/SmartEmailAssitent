package com.ai.email.controller;

import com.ai.email.dto.*;
import com.ai.email.model.EmailDraft;
import com.ai.email.repository.EmailRepository;
import com.ai.email.service.EmailSenderService;
import com.ai.email.service.OllamaService;
import jakarta.mail.AuthenticationFailedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private static final Logger log = LoggerFactory.getLogger(EmailController.class);

    private final OllamaService ollamaService;
    private final EmailSenderService emailSenderService;
    private final EmailRepository emailRepository;

    public EmailController(OllamaService ollamaService,
                           EmailSenderService emailSenderService,
                           EmailRepository emailRepository) {
        this.ollamaService = ollamaService;
        this.emailSenderService = emailSenderService;
        this.emailRepository = emailRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        boolean ollamaOk = ollamaService.isOllamaAvailable();
        boolean smtpOk = emailSenderService.isRealSmtpConfigured();

        status.put("backendOnline", true);
        status.put("ollamaOnline", ollamaOk);
        status.put("model", "llama3.2");
        status.put("smtpConfigured", smtpOk);
        status.put("smtpHost", emailSenderService.getSmtpHost());
        status.put("smtpPort", emailSenderService.getSmtpPort());
        status.put("smtpUser", smtpOk ? emailSenderService.getSmtpUsername() : "Not configured (Sandbox mode)");
        return ResponseEntity.ok(status);
    }

    @PostMapping("/generate")
    public ResponseEntity<EmailGenerateResponse> generateEmail(@RequestBody EmailGenerateRequest request) {
        log.info("Generate email request received for tone: {}, sender: {}", request.getTone(), request.getSender());

        String tone = (request.getTone() != null) ? request.getTone() : "PROFESSIONAL";
        Map<String, String> aiResult = ollamaService.generateEmail(
                request.getPrompt(),
                tone,
                request.getRecipient(),
                request.getSubject(),
                request.getSender()
        );

        String generatedSubject = aiResult.getOrDefault("subject", request.getSubject());
        String generatedBody = aiResult.getOrDefault("body", "");

        // Create and save draft to database
        EmailDraft draft = new EmailDraft(
                request.getRecipient(),
                generatedSubject,
                request.getPrompt(),
                generatedBody,
                tone.toUpperCase()
        );
        draft.setSender(request.getSender());
        if (request.getUserId() != null) {
            draft.setUserId(request.getUserId());
        }
        draft = emailRepository.save(draft);

        EmailGenerateResponse response = new EmailGenerateResponse(
                draft.getId(),
                generatedSubject,
                generatedBody,
                tone.toUpperCase(),
                request.getRecipient(),
                request.getSender()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send")
    public ResponseEntity<EmailSendResponse> sendEmail(@RequestBody EmailSendRequest request) {
        log.info("Send email request received from: '{}' for recipient: '{}'", request.getSender(), request.getRecipient());

        if (request.getRecipient() == null || request.getRecipient().isBlank()) {
            return ResponseEntity.badRequest().body(new EmailSendResponse(false, "Recipient email is required.", null, "FAILED"));
        }

        EmailDraft draft = null;
        if (request.getDraftId() != null) {
            draft = emailRepository.findById(request.getDraftId()).orElse(null);
        }

        if (draft == null) {
            draft = new EmailDraft();
            draft.setUserId(request.getUserId());
            draft.setSender(request.getSender());
            draft.setRecipient(request.getRecipient());
            draft.setSubject(request.getSubject());
            draft.setGeneratedContent(request.getBody());
            draft.setTone(request.getTone() != null ? request.getTone() : "PROFESSIONAL");
        } else {
            if (request.getUserId() != null) {
                draft.setUserId(request.getUserId());
            }
            if (request.getSender() != null && !request.getSender().isBlank()) {
                draft.setSender(request.getSender());
            }
            draft.setRecipient(request.getRecipient());
            draft.setSubject(request.getSubject());
            draft.setGeneratedContent(request.getBody());
            if (request.getTone() != null) {
                draft.setTone(request.getTone());
            }
        }

        try {
            String sendResult = emailSenderService.sendEmail(
                    request.getSender(),
                    request.getRecipient(),
                    request.getSubject(),
                    request.getBody()
            );

            draft.setSentAt(LocalDateTime.now());
            if ("SUCCESS_DELIVERED".equals(sendResult)) {
                draft.setStatus("SENT");
                draft.setStatusMessage("Email sent to " + request.getRecipient() + " from " + (request.getSender() != null ? request.getSender() : "default sender") + " via SMTP.");
                emailRepository.save(draft);
                return ResponseEntity.ok(new EmailSendResponse(
                        true,
                        "Email successfully delivered to " + request.getRecipient() + "!",
                        draft.getId(),
                        "SENT"
                ));
            } else {
                draft.setStatus("SENT (Simulated)");
                draft.setStatusMessage("Simulated delivery (From: " + (request.getSender() != null ? request.getSender() : "Default") + "). Recorded in history.");
                emailRepository.save(draft);
                return ResponseEntity.ok(new EmailSendResponse(
                        true,
                        "Email recorded and sent in Sandbox Mode to " + request.getRecipient() + ". (Configure Gmail/SMTP in Settings for real inbox delivery).",
                        draft.getId(),
                        "SENT_SIMULATED"
                ));
            }
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
            draft.setStatus("FAILED");
            draft.setStatusMessage(e.getMessage());
            emailRepository.save(draft);
            return ResponseEntity.internalServerError().body(new EmailSendResponse(
                    false,
                    "Failed to deliver email: " + e.getMessage(),
                    draft.getId(),
                    "FAILED"
            ));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<EmailDraft>> getHistory(@RequestParam(required = false) Long userId) {
        List<EmailDraft> drafts;
        if (userId != null) {
            drafts = emailRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        } else {
            drafts = emailRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(drafts);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Map<String, String>> deleteHistoryItem(@PathVariable Long id) {
        if (emailRepository.existsById(id)) {
            emailRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Draft removed successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/smtp-config")
    public ResponseEntity<Map<String, Object>> updateSmtpConfig(@RequestBody SmtpConfigRequest config) {
        emailSenderService.updateSmtpConfig(config);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "SMTP Configuration updated successfully");
        resp.put("isConfigured", emailSenderService.isRealSmtpConfigured());
        resp.put("user", emailSenderService.getSmtpUsername());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/smtp-verify")
    public ResponseEntity<Map<String, Object>> verifySmtpConfig(@RequestBody SmtpConfigRequest config) {
        Map<String, Object> resp = new HashMap<>();
        try {
            emailSenderService.testSmtpConnection(config);
            resp.put("success", true);
            resp.put("message", "Gmail credentials verified successfully! Live email delivery is active.");
            resp.put("isConfigured", true);
            resp.put("user", config.getUsername());
            return ResponseEntity.ok(resp);
        } catch (AuthenticationFailedException e) {
            log.error("SMTP verification authentication failed: {}", e.getMessage());
            resp.put("success", false);
            resp.put("message", "Authentication Failed! Google rejected the login. Please check: 1) Did you generate a 16-character App Password? 2) Is 2-Step Verification ON in your Google Account?");
            return ResponseEntity.badRequest().body(resp);
        } catch (Exception e) {
            log.error("SMTP verification error: {}", e.getMessage());
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Failed to connect to SMTP server";
            if (errorMsg.contains("535-5.7.8") || errorMsg.contains("Username and Password not accepted")) {
                errorMsg = "Google Authentication Error: Gmail requires a 16-character App Password (not your normal password). Generate it at https://myaccount.google.com/apppasswords";
            }
            resp.put("success", false);
            resp.put("message", errorMsg);
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/smtp-clear")
    public ResponseEntity<Map<String, Object>> clearSmtpConfig() {
        emailSenderService.clearSmtpConfig();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "SMTP cleared. Application is now running in Sandbox Mode.");
        resp.put("isConfigured", false);
        return ResponseEntity.ok(resp);
    }
}
