package com.ai.email.service;

import com.ai.email.dto.SmtpConfigRequest;
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

        // Recreate mail sender
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost(this.smtpHost);
        impl.setPort(this.smtpPort);
        impl.setUsername(this.smtpUsername);
        impl.setPassword(this.smtpPassword);

        Properties props = impl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.debug", "false");

        this.customMailSender = impl;
        log.info("SMTP configuration updated for user: {}", this.smtpUsername);
    }

    public boolean isRealSmtpConfigured() {
        return smtpUsername != null && !smtpUsername.isBlank() && smtpPassword != null && !smtpPassword.isBlank();
    }

    public String sendEmail(String to, String subject, String body) throws Exception {
        log.info("Sending email to: '{}', Subject: '{}'", to, subject);

        if (!isRealSmtpConfigured()) {
            log.warn("Real SMTP credentials not set. Simulating email dispatch to: {}", to);
            log.info("========== SIMULATED EMAIL OUTBOX ==========");
            log.info("TO: {}", to);
            log.info("SUBJECT: {}", subject);
            log.info("BODY:\n{}", body);
            log.info("============================================");
            return "SUCCESS_SIMULATED";
        }

        JavaMailSender sender = getMailSender();
        MimeMessage mimeMessage = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        String senderAddress = (smtpUsername != null && smtpUsername.contains("@")) ? smtpUsername : fromEmail;
        helper.setFrom(senderAddress, "Smart AI Email Assistant");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, false); // plain text

        sender.send(mimeMessage);
        log.info("Real email successfully dispatched to {}", to);
        return "SUCCESS_DELIVERED";
    }

    private synchronized JavaMailSender getMailSender() {
        if (customMailSender != null) {
            return customMailSender;
        }

        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost(this.smtpHost);
        impl.setPort(this.smtpPort);
        impl.setUsername(this.smtpUsername);
        impl.setPassword(this.smtpPassword);

        Properties props = impl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");

        this.customMailSender = impl;
        return customMailSender;
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
