package com.ai.email.service;

import com.ai.email.dto.SmtpConfigRequest;
import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailSenderService {

    private static final Logger log = LoggerFactory.getLogger(EmailSenderService.class);

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String smtpHost;

    @Value("${spring.mail.port:587}")
    private int smtpPort;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${spring.mail.password:}")
    private String smtpPassword;

    @Value("${spring.mail.from:smart-ai-assistant@local}")
    private String fromEmail;

    private JavaMailSender customMailSender;

    public synchronized void updateSmtpConfig(SmtpConfigRequest config) {
        if (config.getHost() != null && !config.getHost().isBlank()) {
            this.smtpHost = config.getHost().trim();
        }
        if (config.getPort() != null && config.getPort() > 0) {
            this.smtpPort = config.getPort();
        }
        if (config.getUsername() != null) {
            this.smtpUsername = config.getUsername().trim();
        }
        if (config.getPassword() != null) {
            this.smtpPassword = config.getPassword().trim();
        }
        if (config.getFromEmail() != null && !config.getFromEmail().isBlank()) {
            this.fromEmail = config.getFromEmail().trim();
        }

        this.customMailSender = buildMailSender(this.smtpHost, this.smtpPort, this.smtpUsername, this.smtpPassword);
        log.info("SMTP configuration updated dynamically for user: {}", this.smtpUsername);
    }

    public boolean isRealSmtpConfigured() {
        return smtpUsername != null && !smtpUsername.isBlank() && smtpPassword != null && !smtpPassword.isBlank();
    }

    public String sendEmail(String to, String subject, String body) throws Exception {
        return sendEmail(null, to, subject, body);
    }

    public String sendEmail(String senderEmail, String to, String subject, String body) throws Exception {
        log.info("Sending email from: '{}' to: '{}', Subject: '{}'", senderEmail, to, subject);

        if (!isRealSmtpConfigured()) {
            log.warn("Real SMTP credentials not set. Simulating email dispatch from: '{}' to: '{}'", senderEmail, to);
            log.info("========== SIMULATED EMAIL OUTBOX ==========");
            log.info("FROM: {}", (senderEmail != null && !senderEmail.isBlank()) ? senderEmail : "Smart AI Assistant");
            log.info("TO: {}", to);
            log.info("SUBJECT: {}", subject);
            log.info("BODY:\n{}", body);
            log.info("============================================");
            return "SUCCESS_SIMULATED";
        }

        try {
            JavaMailSender sender = getMailSender();
            MimeMessage mimeMessage = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            String senderAddress = (smtpUsername != null && smtpUsername.contains("@")) ? smtpUsername : fromEmail;
            
            if (senderEmail != null && !senderEmail.isBlank()) {
                // Show the sender's name/email in the From header
                helper.setFrom(senderAddress, senderEmail);
                // When recipient clicks Reply, it routes straight to the sender's inbox!
                helper.setReplyTo(senderEmail);
            } else {
                helper.setFrom(senderAddress, "Smart AI Email Assistant");
            }

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);

            sender.send(mimeMessage);
            log.info("Real email successfully dispatched to {} from {}", to, senderEmail);
            return "SUCCESS_DELIVERED";
        } catch (AuthenticationFailedException e) {
            log.error("Authentication failed for user {}: {}", smtpUsername, e.getMessage());
            throw new Exception("Authentication Failed! Google/Gmail accounts reject regular passwords. You MUST use a 16-character 'App Password'. Generate it at https://myaccount.google.com/apppasswords");
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : e.toString();
            if (msg.contains("535-5.7.8") || msg.contains("Username and Password not accepted")) {
                throw new Exception("Google Authentication Error: Gmail requires a 16-character App Password (not your normal Gmail account password). Generate it at https://myaccount.google.com/apppasswords");
            }
            log.error("Failed to deliver email: {}", msg);
            throw e;
        }
    }

    private synchronized JavaMailSender getMailSender() {
        if (customMailSender != null) {
            return customMailSender;
        }
        this.customMailSender = buildMailSender(this.smtpHost, this.smtpPort, this.smtpUsername, this.smtpPassword);
        return customMailSender;
    }

    private JavaMailSenderImpl buildMailSender(String host, int port, String username, String password) {
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost(host);
        impl.setPort(port);
        impl.setUsername(username);
        // Clean spaces if user copied "abcd efgh ijkl mnop"
        String cleanPassword = (password != null) ? password.replaceAll("\\s+", "") : "";
        impl.setPassword(cleanPassword);

        Properties props = impl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "*");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        return impl;
    }

    public void testSmtpConnection(SmtpConfigRequest config) throws Exception {
        String host = (config.getHost() != null && !config.getHost().isBlank()) ? config.getHost().trim() : this.smtpHost;
        int port = (config.getPort() != null && config.getPort() > 0) ? config.getPort() : this.smtpPort;
        String user = (config.getUsername() != null) ? config.getUsername().trim() : "";
        String pass = (config.getPassword() != null) ? config.getPassword().trim() : "";

        if (user.isBlank() || pass.isBlank()) {
            throw new IllegalArgumentException("Gmail address and 16-character App Password are required.");
        }

        JavaMailSenderImpl impl = buildMailSender(host, port, user, pass);
        // Connects to SMTP server and tests authentication
        impl.testConnection();

        // If test passes without exception, activate this configuration
        updateSmtpConfig(config);
    }

    public synchronized void clearSmtpConfig() {
        this.smtpUsername = "";
        this.smtpPassword = "";
        this.customMailSender = null;
        log.info("SMTP configuration cleared. Reverted to Sandbox Mode.");
    }

    public String getSmtpUsername() {
        return smtpUsername;
    }

    public String getSmtpHost() {
        return smtpHost;
    }

    public int getSmtpPort() {
        return smtpPort;
    }
}
